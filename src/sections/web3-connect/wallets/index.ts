import { SubscriptionFn, Wallet, getWallets } from "@talismn/connect-wallets"

import { ExternalWallet } from "./ExternalWallet"
import { MetaMask } from "./MetaMask"
import { Talisman } from "./Talisman"
import { TalismanEvm } from "./TalismanEvm"
import { NovaWallet } from "./NovaWallet"
import { WalletConnect } from "./WalletConnect"
import { H160, isEvmAddress } from "utils/evm"
import { SubWalletEvm } from "./SubWalletEvm"
import { SubWallet } from "./SubWallet"
import { TrustWallet } from "./TrustWallet"
import { BraveWallet } from "./BraveWallet"
import { EIP6963AnnounceProviderEvent } from "sections/web3-connect/types"
import {
  SUBSTRATE_H160_PROVIDERS,
  WalletProviderType,
} from "sections/web3-connect/constants/providers"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletConnectEvm } from "sections/web3-connect/wallets/WalletConnectEvm"
import { CoinbaseWallet } from "sections/web3-connect/wallets/CoinbaseWallet"
import { NightlyEvm } from "sections/web3-connect/wallets/NightlyEvm"
import { Nightly } from "sections/web3-connect/wallets/Nightly"
import { RabbyWallet } from "sections/web3-connect/wallets/RabbyWallet"

export type WalletProvider = {
  type: WalletProviderType
  wallet: Wallet
}

const wallets = getWallets().filter(
  ({ extensionName }) =>
    // filter out wallet providers that are not supported by Hydration
    !SUBSTRATE_H160_PROVIDERS.includes(extensionName as WalletProviderType),
)

const onMetaMaskLikeAccountChange =
  (type: WalletProviderType): SubscriptionFn =>
  (accounts) => {
    const state = useWeb3ConnectStore.getState()
    if (!accounts || accounts.length === 0) {
      state.disconnect(type)
    } else {
      const [{ address, name }] = accounts
      const isEvm = isEvmAddress(address)
      state.setAccount({
        address: isEvm ? new H160(address).toAccount() : address,
        displayAddress: address,
        provider: type,
        name: name ?? "",
        isExternalWalletConnected: false,
      })
    }
  }

const novaWallet: Wallet = new NovaWallet()

const talisman = new Talisman()
const talismanEvm: Wallet = new TalismanEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.TalismanEvm,
  ),
})
const subwallet: Wallet = new SubWallet()
const subwalletEvm: Wallet = new SubWalletEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.SubwalletEvm,
  ),
})

const metaMask: Wallet = new MetaMask({
  onAccountsChanged: onMetaMaskLikeAccountChange(WalletProviderType.MetaMask),
})

const trustWallet: Wallet = new TrustWallet({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.TrustWallet,
  ),
})

const coinbaseWallet: Wallet = new CoinbaseWallet({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.CoinbaseWallet,
  ),
})

const nightly: Wallet = new Nightly()
const nightlyEvm: Wallet = new NightlyEvm({
  onAccountsChanged: onMetaMaskLikeAccountChange(WalletProviderType.NightlyEvm),
})

const rabbyWallet: Wallet = new RabbyWallet({
  onAccountsChanged: onMetaMaskLikeAccountChange(
    WalletProviderType.RabbyWallet,
  ),
})

const walletConnect: Wallet = new WalletConnect({
  onModalClose: (session) => {
    if (!session) {
      const state = useWeb3ConnectStore.getState()
      state.disconnect(WalletProviderType.WalletConnect)
      state.disconnect(WalletProviderType.WalletConnectEvm)
      if (state.open) {
        state.toggle()
      }
    }
  },
  onSesssionDelete: () => {
    const state = useWeb3ConnectStore.getState()
    state.disconnect(WalletProviderType.WalletConnect)
    state.disconnect(WalletProviderType.WalletConnectEvm)
  },
})

const walletConnectEvm: Wallet = new WalletConnectEvm()

const externalWallet: Wallet = new ExternalWallet()

export let SUPPORTED_WALLET_PROVIDERS: WalletProvider[] = [
  ...wallets,
  metaMask,
  talisman,
  talismanEvm,
  subwalletEvm,
  subwallet,
  coinbaseWallet,
  nightly,
  nightlyEvm,
  rabbyWallet,
  trustWallet,
  novaWallet,
  walletConnect,
  walletConnectEvm,
  externalWallet,
].map((wallet) => ({
  wallet,
  type: normalizeProviderType(wallet),
}))

export function normalizeProviderType(wallet: Wallet): WalletProviderType {
  if (wallet instanceof NovaWallet) {
    return WalletProviderType.NovaWallet
  }

  return wallet.extensionName as WalletProviderType
}

export function getSupportedWallets() {
  return SUPPORTED_WALLET_PROVIDERS
}

function syncSupportedWalletProviders(wallet: Wallet) {
  const type = normalizeProviderType(wallet)
  SUPPORTED_WALLET_PROVIDERS = [
    ...SUPPORTED_WALLET_PROVIDERS.filter((provider) => provider.type !== type),
    {
      wallet,
      type,
    },
  ]
}

const eip6963ProvidersByRdns = new Map([
  ["io.metamask", { Wallet: MetaMask, type: WalletProviderType.MetaMask }],
  [
    "com.trustwallet.app",
    { Wallet: TrustWallet, type: WalletProviderType.TrustWallet },
  ],
  [
    "xyz.talisman",
    { Wallet: TalismanEvm, type: WalletProviderType.TalismanEvm },
  ],
  [
    "com.brave.wallet",
    { Wallet: BraveWallet, type: WalletProviderType.BraveWallet },
  ],
  [
    "com.coinbase.wallet",
    { Wallet: CoinbaseWallet, type: WalletProviderType.CoinbaseWallet },
  ],
  ["app.nightly", { Wallet: NightlyEvm, type: WalletProviderType.NightlyEvm }],
  ["io.rabby", { Wallet: RabbyWallet, type: WalletProviderType.RabbyWallet }],
])

/**
 * Handles the event of EIP-6963 standard to announce injected Wallet Providers
 * For more information, refer to https://eips.ethereum.org/EIPS/eip-6963
 */
export function handleAnnounceProvider(event: EIP6963AnnounceProviderEvent) {
  const provider = eip6963ProvidersByRdns.get(event.detail.info.rdns)

  if (provider) {
    syncSupportedWalletProviders(
      new provider.Wallet({
        provider: event.detail.provider,
        onAccountsChanged: onMetaMaskLikeAccountChange(provider.type),
      }),
    )
  }
}
