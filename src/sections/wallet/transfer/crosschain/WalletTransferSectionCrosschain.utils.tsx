import Wormhole from "assets/icons/crosschains/Wormhole.svg?react"
import Carrier from "assets/icons/crosschains/Carrier.svg?react"
import i18n from "i18n/i18n"

export const CROSSCHAINS = [
  {
    icon: <Carrier css={{ borderRadius: "50%" }} />,
    name: "Carrier",
    guide: null,
    description: i18n.t("wallet.assets.transfer.bridge.carrier.description"),
    url: "https://www.carrier.so",
  },
  {
    icon: <Wormhole />,
    name: "Wormhole",
    guide: null,
    description: i18n.t("wallet.assets.transfer.bridge.wormhole.description"),
    url: "https://www.portalbridge.com/#/transfer",
  },
]
