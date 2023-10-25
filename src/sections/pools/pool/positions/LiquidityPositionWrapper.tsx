import { Text } from "components/Typography/Text/Text"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { Positions } from "sections/pools/pool/Pool.utils"
import ChartIcon from "assets/icons/ChartIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { Stablepool, OmnipoolPool } from "sections/pools/PoolsPage.utils"

type Props = {
  positions: Positions
  pool: Stablepool | OmnipoolPool
  disableRemoveLiquidity: boolean
}

export const LiquidityPositionWrapper = ({
  positions,
  pool,
  disableRemoveLiquidity,
}: Props) => {
  const { t } = useTranslation()

  if (!positions.data.length) {
    return null
  }

  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "pink600" }} icon={<ChartIcon />} />
        <Text fs={[16, 16]} color="pink600">
          {t("liquidity.asset.omnipoolPositions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        {positions.data.map((position, i) => (
          <LiquidityPosition
            key={`${i}-${position.assetId}`}
            position={position}
            index={i + 1}
            onSuccess={positions.refetch}
            pool={pool}
            disableRemoveLiquidity={disableRemoveLiquidity}
          />
        ))}
      </div>
    </SPositions>
  )
}
