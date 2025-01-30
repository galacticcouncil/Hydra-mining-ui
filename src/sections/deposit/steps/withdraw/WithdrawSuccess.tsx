import FullSuccessIcon from "assets/icons/FullSuccessIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { Trans, useTranslation } from "react-i18next"
import { useDeposit } from "sections/deposit/DepositPage.utils"

export type WithdrawSuccessProps = {
  onConfirm: () => void
}

export const WithdrawSuccess: React.FC<WithdrawSuccessProps> = ({
  onConfirm,
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  const { asset } = useDeposit()
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
          {t("withdraw.success.title")}
        </Text>
        {assetDetails && (
          <Text fs={16} lh={22} color="basic400" tAlign="center">
            <Trans
              t={t}
              i18nKey="withdraw.success.description"
              values={{
                symbol: assetDetails.symbol,
              }}
            >
              <span sx={{ color: "white" }} />
            </Trans>
          </Text>
        )}
      </div>

      <div sx={{ textAlign: "center" }}>
        <Button variant="mutedSecondary" onClick={onConfirm}>
          {t("withdraw.success.cta.withdrawtMore")}
        </Button>
      </div>
    </div>
  )
}
