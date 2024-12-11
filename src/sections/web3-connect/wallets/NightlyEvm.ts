import NightlyLogo from "assets/icons/NightlyLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isNightly } from "utils/metamask"
import { MetaMask } from "./MetaMask"

export class NightlyEvm extends MetaMask {
  extensionName = WalletProviderType.NightlyEvm
  title = "Nightly"
  installUrl = "https://nightly.app/download"
  logo = {
    src: NightlyLogo,
    alt: "Nightly Logo",
  }

  get installed() {
    return isNightly(this._provider)
  }

  get rawExtension() {
    return this._provider
  }
}
