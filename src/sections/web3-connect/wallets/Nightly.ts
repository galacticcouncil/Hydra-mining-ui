import { InjectedWindow } from "@polkadot/extension-inject/types"
import { BaseDotsamaWallet } from "@talismn/connect-wallets"
import NightlyLogo from "assets/icons/NightlyLogo.svg"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

export class Nightly extends BaseDotsamaWallet {
  extensionName = WalletProviderType.Nightly
  title = "Nightly"
  installUrl = "https://nightly.app/download"
  logo = {
    src: NightlyLogo,
    alt: "Nightly Logo",
  }

  get installed() {
    const injectedWindow = window as Window & InjectedWindow
    const injectedExtension = injectedWindow?.injectedWeb3?.Nightly

    return !!injectedExtension
  }

  get rawExtension() {
    const injectedWindow = window as Window & InjectedWindow
    const injectedExtension = injectedWindow?.injectedWeb3?.Nightly
    return injectedExtension
  }
}
