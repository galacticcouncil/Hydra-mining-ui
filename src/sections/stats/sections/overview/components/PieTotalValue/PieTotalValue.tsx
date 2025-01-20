import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"
import { BN_BILL } from "utils/constants"

type PieTotalValueProps = {
  title: string
  data: string
  isLoading: boolean
}

export const PieTotalValue = ({
  title,
  data,
  isLoading,
}: PieTotalValueProps) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (isLoading)
    return <Skeleton height={isDesktop ? 52 : 20} sx={{ mt: 12 }} />

  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Text color="brightBlue300">{title}</Text>
      <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
        <Text fs={[20, 42]}>
          <DisplayValue value={BN(data)} isUSD compact={BN(data).gt(BN_BILL)} />
        </Text>
      </div>
    </div>
  )
}
