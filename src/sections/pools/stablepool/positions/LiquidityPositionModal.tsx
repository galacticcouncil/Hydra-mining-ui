import { Modal } from "components/Modal/Modal"
import { ComponentProps } from "react"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"

type Props = ComponentProps<typeof LiquidityPosition> & {
  isOpen: boolean
  onClose: () => void
}

export const LiquidityPositionModal = ({
  isOpen,
  onClose,
  ...props
}: Props) => {
  const { t } = useTranslation()
  const positions = usePoolPositions(props.poolId)

  return (
    <Modal
      open={isOpen}
      title={t("liquidity.positions.modal.title")}
      headerVariant="FontOver"
      noPadding={true}
      onClose={onClose}
    >
      <div sx={{ flex: "column", align: "center", gap: 8 }}>
        <LiquidityPosition {...props} />
        <LiquidityPositionWrapper poolId={props.poolId} positions={positions} />
      </div>
    </Modal>
  )
}
