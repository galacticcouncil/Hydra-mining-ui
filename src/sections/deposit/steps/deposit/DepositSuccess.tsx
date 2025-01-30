import { useNavigate } from "@tanstack/react-location"
import FullSuccessIcon from "assets/icons/FullSuccessIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { Trans, useTranslation } from "react-i18next"
import { StepButton } from "sections/deposit/components/StepButton"
import { useDeposit } from "sections/deposit/DepositPage.utils"
import { LINKS } from "utils/navigation"

export type DepositSuccessProps = {
  onConfirm: () => void
}

export const DepositSuccess: React.FC<DepositSuccessProps> = ({
  onConfirm,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getAsset } = useAssets()
  const { depositedAmount, asset } = useDeposit()
  const assetDetails = asset ? getAsset(asset.assetId) : null

  return (
    <div
      sx={{ flex: "column", justify: "space-between", px: [10, 30], gap: 30 }}
    >
      <div>
        <Icon
          size={48}
          sx={{ mx: "auto", mb: 16 }}
          icon={<FullSuccessIcon />}
        />
        <Text fs={19} lh={24} font="GeistMono" tAlign="center" sx={{ mb: 10 }}>
          {t("deposit.success.title")}
        </Text>
        {assetDetails && (
          <Text fs={16} lh={22} color="basic400" tAlign="center">
            <Trans
              t={t}
              i18nKey="deposit.success.description"
              values={{
                value: depositedAmount.toString(),
                symbol: assetDetails.symbol,
                fixedPointScale: assetDetails.decimals,
              }}
            >
              <span sx={{ color: "white" }} />
            </Trans>
          </Text>
        )}
      </div>

      <div sx={{ flex: "column", gap: 20 }}>
        <StepButton
          title={t("deposit.success.cta.staking.title")}
          description={t("deposit.success.cta.staking.description")}
          onClick={() => navigate({ to: LINKS.staking })}
        />
        <StepButton
          title={t("deposit.success.cta.borrow.title")}
          description={t("deposit.success.cta.borrow.description")}
          onClick={() => navigate({ to: LINKS.borrow })}
        />
        <StepButton
          title={t("deposit.success.cta.liquidity.title")}
          description={t("deposit.success.cta.liquidity.description")}
          onClick={() => navigate({ to: LINKS.liquidity })}
        />
        <StepButton
          title={t("deposit.success.cta.trade.title")}
          description={t("deposit.success.cta.trade.description")}
          onClick={() => navigate({ to: LINKS.trade })}
        />
        <StepButton
          title={t("deposit.success.cta.wallet.title")}
          description={t("deposit.success.cta.wallet.description")}
          onClick={() => navigate({ to: LINKS.walletAssets })}
        />
      </div>
      <div sx={{ textAlign: "center" }}>
        <Button variant="mutedSecondary" onClick={onConfirm}>
          {t("deposit.success.cta.depositMore")}
        </Button>
      </div>
    </div>
  )
}
