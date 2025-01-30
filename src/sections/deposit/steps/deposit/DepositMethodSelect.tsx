import { useNavigate } from "@tanstack/react-location"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { useTranslation } from "react-i18next"
import { StepButton } from "sections/deposit/components/StepButton"
import { DepositMethod } from "sections/deposit/types"
import { LINKS } from "utils/navigation"

type DepositMethodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <>
      <div>
        <GradientText fs={28} gradient="pinkLightBlue" sx={{ mb: 20 }}>
          {t("deposit")}
        </GradientText>
      </div>
      <div sx={{ flex: "column", gap: 20 }}>
        <StepButton
          onClick={() => onSelect(DepositMethod.DepositCex)}
          title={t("deposit.method.cex.title")}
          description={t("deposit.method.cex.description")}
        />
        <StepButton
          onClick={() => navigate({ to: LINKS.cross_chain })}
          title={t("deposit.method.onchain.title")}
          description={t("deposit.method.onchain.description")}
        />
        <StepButton
          onClick={() => onSelect(DepositMethod.DepositCrypto)}
          title={t("deposit.method.crypto.title")}
          description={t("deposit.method.crypto.description")}
        />
      </div>
    </>
  )
}
