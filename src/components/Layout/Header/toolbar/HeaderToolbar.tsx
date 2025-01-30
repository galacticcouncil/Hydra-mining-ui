import { useMedia } from "react-use"
import { theme } from "theme"
import { Bell } from "./buttons/Bell"
import { Deposit } from "./buttons/Deposit"
import { Documentation } from "./buttons/Documentation"
import { Settings } from "./buttons/Settings"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

export const HeaderToolbar = () => {
  const isSmallMedia = useMedia(theme.viewport.lt.sm)
  const matchRoute = useMatchRoute()

  const isSubmitTransactionPath = matchRoute({ to: LINKS.submitTransaction })

  return (
    <div sx={{ flex: "row", align: "center", gap: 14 }}>
      <div sx={{ flex: "row", gap: 10, align: "center" }}>
        {!isSmallMedia && <Documentation />}
        <Bell />
        {!isSmallMedia && !isSubmitTransactionPath && <Settings />}
        {!isSmallMedia && <Deposit />}
      </div>
      <Web3ConnectModalButton size="small" css={{ maxHeight: 40 }} />
    </div>
  )
}
