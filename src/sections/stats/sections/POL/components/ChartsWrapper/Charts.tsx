import { StatsTimeframe, useStats } from "api/stats"
import { BarChart } from "components/Charts/BarChart/BarChart"
import { AreaChart } from "components/Charts/AreaChart/AreaChart"
import { ChartType } from "./ChartsWrapper"
import BN from "bignumber.js"

export const Charts = ({
  type,
  timeframe,
  assetId,
  POLMultiplier,
}: {
  type: ChartType
  timeframe: StatsTimeframe
  assetId?: string
  POLMultiplier?: string
}) => {
  const stats = useStats({
    timeframe,
    assetId,
    type: "volume",
  })

  const multiplieriedVolumeData = POLMultiplier
    ? stats.data?.map((statsValue) => ({
        ...statsValue,
        volume_usd: BN(POLMultiplier)
          .multipliedBy(statsValue.volume_usd)
          .toNumber(),
      }))
    : stats.data

  return type === "volume" ? (
    <BarChart
      data={multiplieriedVolumeData}
      loading={stats.isLoading}
      error={stats.isError}
      timeframe={timeframe}
    />
  ) : (
    <AreaChart
      dataKey="tvl_pol_usd"
      data={stats.data}
      loading={stats.isLoading}
      error={stats.isError}
      timeframe={timeframe}
    />
  )
}
