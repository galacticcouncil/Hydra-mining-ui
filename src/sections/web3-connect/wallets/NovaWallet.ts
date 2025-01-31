import { BaseDotsamaWallet } from "@talismn/connect-wallets"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import NovaWalletLogo from "assets/icons/NovaWallet.svg"

export class NovaWallet extends BaseDotsamaWallet {
  extensionName = WalletProviderType.PolkadotJS // Nova Wallet acts as polkadot-js wallet
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  appLink = `https://app.novawallet.io/open/dapp?url=https%3A%2F%2Fapp.hydration.net`
  logo = {
    src: NovaWalletLogo,
    alt: "Nova Wallet Logo",
  }
  get installed() {
    const injectedExtension = window?.injectedWeb3?.[this.extensionName]
    const isNovaWallet = window?.walletExtension?.isNovaWallet

    return !!(injectedExtension && isNovaWallet)
  }
}
