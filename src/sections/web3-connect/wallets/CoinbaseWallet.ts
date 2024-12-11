import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isCoinbaseWallet } from "utils/metamask"
import { MetaMask } from "./MetaMask"
import CoinbaseWalletLogo from "assets/icons/CoinbaseWalletLogo.svg"

export class CoinbaseWallet extends MetaMask {
  extensionName = WalletProviderType.CoinbaseWallet
  title = "Coinbase Wallet"
  installUrl = "https://www.coinbase.com/wallet"
  logo = {
    src: CoinbaseWalletLogo,
    alt: "Coinbase Wallet Logo",
  }

  get installed() {
    const provider = this._provider || window.ethereum
    return isCoinbaseWallet(provider)
  }

  get rawExtension() {
    return this._provider || window.ethereum
  }
}
