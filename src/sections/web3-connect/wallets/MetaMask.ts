import { SubscriptionFn, Wallet, WalletAccount } from "@talismn/connect-wallets"
import MetaMaskLogo from "assets/icons/MetaMask.svg"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { EIP1193Provider } from "sections/web3-connect/types"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { shortenAccountAddress } from "utils/formatting"
import { noop } from "utils/helpers"
import {
  MetaMaskLikeProvider,
  isMetaMask,
  isMetaMaskLike,
} from "utils/metamask"
import { safeConvertAddressH160 } from "utils/evm"

type ChainSubscriptionFn = (payload: number | null) => void | Promise<void>

type MetamaskInit = {
  provider?: EIP1193Provider
  onAccountsChanged?: SubscriptionFn
  onChainChanged?: ChainSubscriptionFn
}

export class MetaMask implements Wallet {
  extensionName = WalletProviderType.MetaMask
  title = "MetaMask"
  installUrl = "https://metamask.io/download"
  logo = {
    src: MetaMaskLogo,
    alt: "MetaMask Logo",
  }

  _extension: Required<MetaMaskLikeProvider> | undefined
  _signer: EthereumSigner | undefined
  _provider: EIP1193Provider | undefined

  onAccountsChanged: SubscriptionFn | undefined
  onChainChanged: ChainSubscriptionFn | undefined

  constructor(
    { provider, onAccountsChanged, onChainChanged }: MetamaskInit = {
      onAccountsChanged: noop,
      onChainChanged: noop,
    },
  ) {
    this.onAccountsChanged = onAccountsChanged
    this.onChainChanged = onChainChanged
    this._provider = provider
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    const provider = this._provider || window.ethereum
    return isMetaMask(provider) && !isMetaMaskLike(provider)
  }

  get rawExtension() {
    return this._provider || window.ethereum
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    try {
      if (
        !isMetaMask(this.rawExtension) &&
        !isMetaMaskLike(this.rawExtension)
      ) {
        return
      }

      const metamask = this.rawExtension

      const addresses = await metamask.request({
        method: "eth_requestAccounts",
        params: [],
      })

      const address =
        Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : ""

      this._extension = metamask
      this._signer = address ? new EthereumSigner(address, metamask) : undefined

      this.subscribeAccounts(this.onAccountsChanged)
      this.subscribeChain(this.onChainChanged)
    } catch (err: any) {
      // don't treat pending requests as errors
      if (err.code === -32002) {
        return
      }
      throw this.transformError(err as Error)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    const accounts = (await this._extension.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[]

    return (accounts || [])
      .filter((address): address is string => !!address)
      .slice(0, 1)
      .map(this.toWalletAccount)
  }

  toWalletAccount = (address: string): WalletAccount => {
    const formattedAddress = safeConvertAddressH160(address)!
    return {
      address: formattedAddress,
      source: this.extensionName,
      name: shortenAccountAddress(formattedAddress),
      wallet: this,
      signer: this.signer,
    }
  }

  subscribeAccounts = async (callback?: SubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("accountsChanged", (payload) => {
      const addresses = Array.isArray(payload)
        ? payload.map((item: string) => item)
        : []

      const accounts = addresses.slice(0, 1).map(this.toWalletAccount)
      callback?.(accounts)

      const mainAccount = accounts[0]
      this._signer?.setAddress(mainAccount?.address)
    })
  }

  subscribeChain = async (callback?: ChainSubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("chainChanged", async (payload) => {
      const chainId = typeof payload === "string" ? parseInt(payload) : null
      callback?.(chainId)
    })
  }

  unsubscribe = () => {
    this._extension?.removeAllListeners?.()
    this._extension = undefined
    this._signer = undefined
  }
}
