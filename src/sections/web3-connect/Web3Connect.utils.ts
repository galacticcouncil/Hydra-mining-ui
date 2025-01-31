import { useNavigate, useSearch } from "@tanstack/react-location"
import {
  MutationObserverOptions,
  QueryObserverOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { useShallow } from "hooks/useShallow"
import { useEffect, useMemo, useRef } from "react"
import { usePrevious } from "react-use"
import {
  NamespaceType,
  WalletConnect,
} from "sections/web3-connect/wallets/WalletConnect"
import { POLKADOT_APP_NAME } from "utils/api"
import {
  H160,
  getEvmAddress,
  isEvmAccount,
  isEvmAddress,
  isEvmWalletExtension,
} from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  Account,
  COMPATIBLE_WALLET_PROVIDERS,
  WalletMode,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "./store/useWeb3ConnectStore"
import {
  getSupportedWallets,
  handleAnnounceProvider,
  normalizeProviderType,
  WalletProvider,
} from "./wallets"
import { ExternalWallet } from "./wallets/ExternalWallet"
import { MetaMask } from "./wallets/MetaMask"
import {
  isMetaMask,
  isMetaMaskLike,
  requestNetworkSwitch,
} from "utils/metamask"
import { genesisHashToChain, isNotNil } from "utils/helpers"
import { useIsEvmAccountBound } from "api/evm"
import {
  EIP6963AnnounceProviderEvent,
  WalletAccount,
} from "sections/web3-connect/types"
import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  WalletProviderType,
} from "sections/web3-connect/constants/providers"
import { useAddressStore } from "components/AddressBook/AddressBook.utils"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { PolkadotSigner } from "sections/web3-connect/signer/PolkadotSigner"
import { SubWallet } from "sections/web3-connect/wallets/SubWallet"
import { Talisman } from "sections/web3-connect/wallets/Talisman"
import { create } from "zustand"
import { safeConvertSolanaAddressToSS58 } from "utils/solana"
import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
export type { WalletProvider } from "./wallets"
export { WalletProviderType, getSupportedWallets }

export const useWallet = () => {
  const providerType = useWeb3ConnectStore(
    useShallow((state) => state.account?.provider),
  )
  return getWalletProviderByType(providerType)
}

export const useAccount = () => {
  const account = useWeb3ConnectStore(useShallow((state) => state.account))
  return { account }
}

export const useEvmAccount = () => {
  const { account } = useAccount()
  const { wallet } = useWallet()

  const address = account?.address ?? ""

  const isEvm = isEvmAccount(address)

  const evmAddress = useMemo(() => {
    if (!address) return ""
    if (isEvm) return H160.fromAccount(address)
    return H160.fromSS58(address)
  }, [isEvm, address])

  const accountBinding = useIsEvmAccountBound(evmAddress)
  const isBound = isEvm ? true : !!accountBinding.data

  const evm = useQuery(
    QUERY_KEYS.evmChainInfo(address),
    async () => {
      const chainId = isEvmWalletExtension(wallet?.extension)
        ? await wallet?.extension?.request({ method: "eth_chainId" })
        : null

      return {
        chainId: Number(chainId),
      }
    },
    {
      enabled: !!address && !!wallet?.extension,
    },
  )

  if (!address) {
    return {
      isBound: false,
      isLoading: false,
      account: null,
    }
  }

  return {
    isBound,
    isLoading: isEvm
      ? evm.isLoading
      : accountBinding.isLoading || evm.isLoading,
    account: {
      chainId: isEvm
        ? evm.data?.chainId ?? null
        : parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
      name: account?.name ?? "",
      address: isBound ? evmAddress : "",
    },
  }
}

export const useConnectedProviders = () => {
  const { getConnectedProviders } = useWeb3ConnectStore()

  const providers = getConnectedProviders()

  return useMemo(() => {
    return providers
      .map(({ status, type }) => {
        const provider = getWalletProviderByType(type)
        return !!provider?.wallet && status === WalletProviderStatus.Connected
          ? provider
          : null
      })
      .filter(isNotNil)
  }, [providers])
}

export const useConnectedProvider = (type: WalletProviderType | null) => {
  const connectedProviders = useConnectedProviders()

  return useMemo(
    () =>
      connectedProviders.find((p) => p.type === type) ?? {
        wallet: null,
        type: null,
      },
    [connectedProviders, type],
  )
}

export const useWalletAccounts = (
  type?: WalletProviderType | null,
  options?: QueryObserverOptions<WalletAccount[], unknown, Account[]>,
) => {
  const mode = useWeb3ConnectStore(useShallow((state) => state.mode))
  const connectedProviders = useConnectedProviders()

  return useQuery<WalletAccount[], unknown, Account[]>(
    QUERY_KEYS.providerAccounts(
      connectedProviders
        .map(({ type }) => getProviderQueryKey(type, mode))
        .join("-"),
    ),
    async () => {
      const accounts = (
        await Promise.all(
          connectedProviders.map(async ({ wallet }) => {
            if (!wallet) return []
            try {
              return await wallet.getAccounts()
            } catch (e) {
              return []
            }
          }),
        )
      ).flat()
      return accounts
    },
    {
      enabled: connectedProviders.length > 0,
      select: (data) => {
        if (!data) return []
        if (type) {
          return data
            .map(mapWalletAccount)
            .filter(({ provider }) => provider === type)
        }
        return data.map(mapWalletAccount)
      },
      cacheTime: 0,
      staleTime: 5000,
      keepPreviousData: true,
      ...options,
    },
  )
}

export const useAnnounceProviders = () => {
  useEffect(() => {
    const announceProvider = (e: unknown) =>
      handleAnnounceProvider(e as EIP6963AnnounceProviderEvent)

    window.addEventListener("eip6963:announceProvider", announceProvider)
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    return () => {
      window.removeEventListener("eip6963:announceProvider", announceProvider)
    }
  }, [])
}

export const useWeb3ConnectEagerEnable = () => {
  useAnnounceProviders()

  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      account: string
    }
  }>()

  const providers = useWeb3ConnectStore(useShallow((store) => store.providers))
  const prevProviders = usePrevious(providers)

  const externalAddressRef = useRef(search?.account)

  useEffect(() => {
    const state = useWeb3ConnectStore.getState()
    const { providers, account: currentAccount } = state

    if (
      externalAddressRef.current &&
      externalAddressRef.current !== currentAccount?.address
    ) {
      // override wallet from search param
      return setExternalWallet(externalAddressRef.current)
    }

    if (providers.length > 0) {
      providers.forEach((p) => {
        const isCompatible =
          currentAccount?.provider === p.type ||
          COMPATIBLE_WALLET_PROVIDERS.includes(p.type)

        const { wallet } = getWalletProviderByType(p.type)
        if (wallet && isCompatible) {
          eagerEnable(wallet)
        } else {
          state.disconnect(p.type)
        }
      })
    } else {
      state.disconnect()
    }

    async function eagerEnable(wallet: WalletProvider["wallet"]) {
      if (wallet instanceof ExternalWallet) {
        if (currentAccount?.provider === WalletProviderType.ExternalWallet) {
          await wallet.setAddress(currentAccount.address)
          if (currentAccount?.delegate) {
            // enable proxy wallet for delegate
            await wallet.enableProxy(POLKADOT_APP_NAME)
          }
        } else {
          state.disconnect(WalletProviderType.ExternalWallet)
        }

        return
      }

      // skip if already enabled
      const isEnabled = !!wallet?.extension

      // disconnect on missing WalletConnect session
      if (wallet instanceof WalletConnect) {
        try {
          await wallet?.enable(POLKADOT_APP_NAME)
        } catch (error) {
          state.disconnect(WalletProviderType.WalletConnect)
          state.disconnect(WalletProviderType.WalletConnectEvm)
        } finally {
          return
        }
      }

      if (isEnabled) return

      await wallet?.enable(POLKADOT_APP_NAME)
    }
  }, [])

  useEffect(() => {
    prevProviders?.forEach(({ type }) => {
      const hasWalletDisconnected = !providers.find((p) => p.type === type)
      const { wallet } = getWalletProviderByType(type)
      if (wallet && hasWalletDisconnected) {
        cleanUp(wallet)
      }
    })

    function cleanUp(wallet: WalletProvider["wallet"]) {
      if (wallet instanceof WalletConnect) {
        // disconnect from WalletConnect
        wallet.disconnect()
      }

      if (wallet instanceof MetaMask) {
        // unsub from metamask events on disconnect
        wallet.unsubscribe()
      }

      if (wallet instanceof ExternalWallet) {
        // reset external wallet on disconnect
        wallet.setAddress(undefined)
        navigate({ search: { account: undefined } })
      }
    }
  }, [navigate, prevProviders, providers])
}

export const useEnableWallet = (
  provider: WalletProviderType | null,
  options?: MutationObserverOptions<
    WalletAccount[] | undefined,
    unknown,
    NamespaceType | void,
    unknown
  >,
) => {
  const { wallet } = getWalletProviderByType(provider)
  const disconnect = useWeb3ConnectStore(
    useShallow((state) => state.disconnect),
  )

  const { add: addToAddressBook } = useAddressStore()
  const meta = useWeb3ConnectStore(useShallow((state) => state.meta))
  const { mutate: enable, ...mutation } = useMutation<
    WalletAccount[] | undefined,
    unknown,
    NamespaceType | void,
    unknown
  >(
    async (namespace) => {
      if (wallet instanceof WalletConnect && namespace) {
        wallet.setNamespace(namespace)
      }

      await wallet?.enable(POLKADOT_APP_NAME)

      if (wallet instanceof MetaMask) {
        await requestNetworkSwitch(wallet.extension, {
          chain: meta?.chain,
        })
      }

      return wallet?.getAccounts()
    },
    {
      retry: false,
      ...options,
      onSuccess: (...args) => {
        const [data] = args
        if (data?.length) {
          const addresses = data
            .map((account) => {
              const { displayAddress, name, provider } =
                mapWalletAccount(account)
              return {
                address: displayAddress,
                name,
                provider,
              }
            })
            .filter(
              ({ provider }) => provider !== WalletProviderType.ExternalWallet,
            )
          addToAddressBook(addresses)
        }
        options?.onSuccess?.(...args)
      },
    },
  )

  return {
    enable,
    disconnect,
    ...mutation,
  }
}

export const useEvmWalletReadiness = () => {
  const { wallet } = useWallet()
  const { account } = useEvmAccount()
  const address = account?.address ?? ""

  const isEvmExtension =
    isMetaMask(wallet?.extension) || isMetaMaskLike(wallet?.extension)

  return useQuery(
    QUERY_KEYS.evmWalletReadiness(address),
    async () => {
      const getIsReady = async () => {
        const balance = isEvmExtension
          ? await wallet?.extension?.request({
              method: "eth_getBalance",
              params: [address, "latest"],
            })
          : null

        return !!balance
      }

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(false)
        }, 2500)

        getIsReady()
          .then((response) => {
            clearTimeout(timer)
            resolve(response)
          })
          .catch(() => {
            clearTimeout(timer)
            resolve(false)
          })
      })
    },
    {
      enabled: isEvmExtension && !!address,
      cacheTime: 0,
      staleTime: 0,
      initialData: true,
      refetchInterval: 5000,
    },
  )
}

export function setExternalWallet(externalAddress = "") {
  const state = useWeb3ConnectStore.getState()

  const { wallet } = getWalletProviderByType(WalletProviderType.ExternalWallet)
  const externalWallet = wallet instanceof ExternalWallet ? wallet : null

  if (!externalWallet) return

  // reuse same account from store if addresses match
  if (state.account?.address === externalAddress) {
    externalWallet.setAddress(externalAddress)
    return
  }

  const isHydra = !!safeConvertAddressSS58(externalAddress, 0)
  const isEvm = isEvmAddress(externalAddress ?? "")
  const isValidAddress = externalAddress && (isHydra || isEvm)

  if (isValidAddress) {
    const address = isEvm
      ? new H160(getEvmAddress(externalAddress)).toAccount()
      : externalAddress

    externalWallet.setAddress(address)
    return useWeb3ConnectStore.setState({
      providers: [
        {
          type: WalletProviderType.ExternalWallet,
          status: WalletProviderStatus.Connected,
        },
      ],
      account: {
        name: externalWallet.accountName,
        address: address ?? "",
        displayAddress: isEvm
          ? getEvmAddress(externalAddress)
          : externalAddress,
        provider: WalletProviderType.ExternalWallet,
        isExternalWalletConnected: true,
        delegate: "",
      },
    })
  }
}

export function isEvmProvider(provider?: WalletProviderType | null) {
  if (!provider) return false
  return EVM_PROVIDERS.includes(provider)
}

export function getWalletProviderByType(type?: WalletProviderType | null) {
  // override WC-EVM with regular WC provider, as WC-EVM provider is only a placeholder in the UI
  const providerType =
    type === WalletProviderType.WalletConnectEvm
      ? WalletProviderType.WalletConnect
      : type
  return (
    getSupportedWallets().find(
      (provider) => provider.type === providerType,
    ) ?? {
      wallet: null,
      type: null,
    }
  )
}

function getProviderQueryKey(
  type: WalletProviderType | null,
  mode: WalletMode,
) {
  const { wallet } = getWalletProviderByType(type)

  if (wallet?.signer instanceof PolkadotSigner) {
    return [type, wallet.signer?.session?.topic].filter(Boolean).join("-")
  }

  if (wallet?.signer instanceof EthereumSigner) {
    return [type, wallet.signer?.address].filter(Boolean).join("-")
  }

  if (wallet instanceof ExternalWallet) {
    return [type, wallet.account?.address].filter(Boolean).join("-")
  }

  if (wallet instanceof SubWallet || wallet instanceof Talisman) {
    return [type, mode].filter(Boolean).join("-")
  }

  return type ?? ""
}

function mapWalletAccount({
  address,
  name,
  wallet,
  genesisHash,
}: WalletAccount) {
  const isEvm = isEvmAddress(address)
  const isSolana =
    wallet &&
    SOLANA_PROVIDERS.includes(wallet.extensionName as WalletProviderType)

  const chainInfo = genesisHashToChain(genesisHash)

  return {
    address: isEvm
      ? new H160(address).toAccount()
      : isSolana
        ? safeConvertSolanaAddressToSS58(address, HYDRADX_SS58_PREFIX)
        : address,
    displayAddress:
      isEvm || isSolana
        ? address
        : safeConvertAddressSS58(address, chainInfo.prefix) || address,
    genesisHash,
    name: name ?? "",
    provider: normalizeProviderType(wallet!),
    isExternalWalletConnected: wallet instanceof ExternalWallet,
  }
}

export function getWalletModeIcon(mode: WalletMode) {
  try {
    if (mode === WalletMode.EVM) {
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/ethereum/1/icon.svg"
    }
    if (mode === WalletMode.Substrate) {
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/5/icon.svg"
    }

    if (mode === WalletMode.Solana) {
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/solana/101/icon.svg"
    }

    return ""
  } catch (e) {}
}

export const useAccountBalanceMap = create<{
  balanceMap: Map<string, string>
  setBalanceMap: (address: string, balance: string) => void
}>((set) => ({
  balanceMap: new Map(),
  setBalanceMap: (address, balance) => {
    set(({ balanceMap }) => ({
      balanceMap: new Map(balanceMap).set(address, balance),
    }))
  },
}))

export const isHydrationIncompatibleAccount = (
  account: Account | null,
): account is Account => {
  if (!account) return false

  const isIncompatibleProvider = !COMPATIBLE_WALLET_PROVIDERS.includes(
    account.provider,
  )

  const isIncompatibleH160Account =
    SUBSTRATE_H160_PROVIDERS.includes(account.provider) &&
    isEvmAccount(account.address)

  return isIncompatibleProvider || isIncompatibleH160Account
}
