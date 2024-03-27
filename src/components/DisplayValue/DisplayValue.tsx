import BigNumber from "bignumber.js"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useDisplayAssetStore } from "utils/displayAsset"

type Props = {
  value: BigNumber | number | null | ReactNode
  isUSD?: boolean
  withGap?: boolean
  compact?: boolean
}

export const DisplayValue = ({
  value,
  isUSD,
  compact = false,
  withGap,
}: Props) => {
  const { t } = useTranslation()
  const store = useDisplayAssetStore()

  const isFiat = isUSD || store.isStableCoin || store.isFiat
  const isNumber = BigNumber.isBigNumber(value) || typeof value === "number"

  return (
    <>
      {isFiat && (
        <span sx={{ mr: withGap ? [2, 4] : undefined }}>
          {isUSD ? "$" : store.symbol}
        </span>
      )}

      {isNumber
        ? t(compact ? "value.compact" : "value", {
            value,
            type: isFiat ? "dollar" : "token",
          })
        : value}
      {!isFiat && <>&nbsp;{store.symbol}</>}
    </>
  )
}
