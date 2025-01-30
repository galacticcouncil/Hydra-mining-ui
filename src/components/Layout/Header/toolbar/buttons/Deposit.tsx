import { useNavigate } from "@tanstack/react-location"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"

export const Deposit = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Button
      size="compact"
      variant="mutedSecondary"
      onClick={() => navigate({ to: LINKS.deposit })}
    >
      <Icon size={18} sx={{ ml: -4 }} icon={<DownloadIcon />} />
      {t("deposit")}
    </Button>
  )
}
