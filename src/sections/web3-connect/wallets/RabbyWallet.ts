import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isRabbyWallet } from "utils/metamask"
import { MetaMask } from "./MetaMask"
import RabbyWalletLogo from "assets/icons/RabbyWalletLogo.svg"

export class RabbyWallet extends MetaMask {
  extensionName = WalletProviderType.RabbyWallet
  title = "Rabby Wallet"
  installUrl = "https://rabby.io"
  logo = {
    src: RabbyWalletLogo,
    alt: "Rabby Wallet Logo",
  }

  get installed() {
    const provider = this._provider || window.ethereum
    return isRabbyWallet(provider)
  }

  get rawExtension() {
    return this._provider || window.ethereum
  }
}
