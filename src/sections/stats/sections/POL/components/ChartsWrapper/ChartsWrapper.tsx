import { useTranslation } from "react-i18next"
import { StatsTimeframe } from "api/stats"
import { Charts } from "./Charts"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"

export type ChartType = "pol" | "volume"

type Props = { assetId?: string; POLMultiplier: string }

export const ChartsWrapper = ({ assetId, POLMultiplier }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <div
        sx={{
          flex: ["row-reverse", "column"],
          justify: "space-between",
          gap: 20,
        }}
      >
        <div sx={{ flex: "row", gap: [4, 12], justify: ["end", "start"] }}>
          <Text color="brightBlue300">{t("stats.chart.dailyVolume")}</Text>
        </div>

        <Spacer size={22} />
      </div>
      <Charts
        type="volume"
        timeframe={StatsTimeframe.HOURLY}
        assetId={assetId}
        POLMultiplier={POLMultiplier}
      />
    </>
  )
}
