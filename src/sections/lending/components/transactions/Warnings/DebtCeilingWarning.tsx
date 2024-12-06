import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { Alert } from "components/Alert"

type DebtCeilingWarningProps = {
  debtCeiling: AssetCapData
}

export const DebtCeilingWarning = ({
  debtCeiling,
  ...rest
}: DebtCeilingWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!debtCeiling.percentUsed || debtCeiling.percentUsed < 98) return null

  const renderText = () => {
    return debtCeiling.isMaxed ? (
      <span>
        Protocol debt ceiling is at 100% for this asset. Further borrowing
        against this asset is unavailable.
      </span>
    ) : (
      <span>
        Maximum amount available to borrow against this asset is limited because
        debt ceiling is at {debtCeiling.percentUsed.toFixed(2)}%.
      </span>
    )
  }

  return (
    <Alert variant={debtCeiling.isMaxed ? "error" : "warning"} {...rest}>
      {renderText()}
    </Alert>
  )
}
