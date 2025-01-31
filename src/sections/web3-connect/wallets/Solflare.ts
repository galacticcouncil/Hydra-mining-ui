import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import SolflareLogo from "assets/icons/SolflareLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { SolanaSigner } from "sections/web3-connect/signer/SolanaSigner"
import { shortenAccountAddress } from "utils/formatting"
import { isAndroidDevice } from "utils/helpers"
import { isSolflare, SolanaWalletProvider } from "utils/solana"

const DEEP_LINK =
  "solflare://v1/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"
const UNIVERSAL_LINK =
  "https://solflare.com/ul/v1/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"

export class Solflare implements Wallet {
  extensionName = WalletProviderType.Solflare
  title = "Solflare"
  installUrl = "https://solflare.com"
  appLink = isAndroidDevice() ? DEEP_LINK : UNIVERSAL_LINK
  deepLink = DEEP_LINK
  universalLink = UNIVERSAL_LINK
  logo = {
    src: SolflareLogo,
    alt: "Solflare Logo",
  }

  _extension: SolanaWalletProvider | undefined
  _signer: SolanaSigner | undefined

  _accounts: WalletAccount[] = []

  get installed() {
    return isSolflare(window?.solflare)
  }

  get rawExtension() {
    return window?.solflare
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    if (!this.rawExtension) return

    const wallet = this.rawExtension

    try {
      const connection = await wallet.connect()
      const publicKey = connection?.publicKey || wallet.publicKey
      if (!publicKey) return

      const address = publicKey.toBase58()

      this._extension = wallet
      this._signer = address ? new SolanaSigner(address, wallet) : undefined

      this.setAccounts([
        {
          address,
          source: this.extensionName,
          name: shortenAccountAddress(address),
          wallet: this,
          signer: this.signer,
        },
      ])

      this.subscribeAccounts()
    } catch (err: any) {
      throw this.transformError(err as Error)
    }
  }

  setAccounts = (accounts: WalletAccount[]) => {
    this._accounts = accounts
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return this._accounts
  }

  subscribeAccounts = async () => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("accountChanged", (publicKey) => {
      const address = publicKey.toBase58()

      this._signer = address
        ? new SolanaSigner(address, this._extension!)
        : undefined

      this.setAccounts([
        {
          address,
          source: this.extensionName,
          name: shortenAccountAddress(address),
          wallet: this,
          signer: this.signer,
        },
      ])
    })

    // @TODO: implement account change if possible
  }

  unsubscribe = () => {}
}
