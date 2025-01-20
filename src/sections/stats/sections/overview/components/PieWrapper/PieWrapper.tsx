import { PieChart } from "sections/stats/components/PieChart/PieChart"
import { PieTotalValue } from "sections/stats/sections/overview/components/PieTotalValue/PieTotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { useTranslation } from "react-i18next"
import { ChartWrapper } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import {
  TUseOmnipoolAssetDetailsData,
  useTreasuryAssets,
} from "sections/stats/StatsPage.utils"
import { omit } from "utils/rx"
import BN from "bignumber.js"

type PieWrapperProps = {
  data: TUseOmnipoolAssetDetailsData
  isLoading: boolean
  className?: string
}

export const PieWrapper = ({ data, className }: PieWrapperProps) => {
  const { t } = useTranslation()
  const { isLoading, total, totalTvl, totalVolume } = useTreasuryAssets()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )
  const pieChartData = useMemo(
    () => data.map((props) => omit(["farms"], props)),
    [data],
  )

  const isLoadingVolume = data?.some((pool) => pool.isLoadingVolume)

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <PieTotalValue
        title={t("stats.overview.pie.values.tvl")}
        data={totalTvl}
        isLoading={isLoading}
      />
      <div
        sx={{
          flex: ["row", "column"],
          justify: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
        css={{ "& > span": { width: "100%" } }}
      >
        <PieTotalValue
          title={t("stats.overview.pie.values.pol")}
          data={total ?? "0"}
          isLoading={isLoading}
        />
        <PieTotalValue
          title={t("stats.overview.pie.values.volume")}
          data={BN(totalVolume).div(2).toString()}
          isLoading={isLoading || isLoadingVolume}
        />
      </div>
    </div>
  )

  return (
    <SContainerVertical className={className}>
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        <>
          {!isLoading ? (
            <PieChart data={pieChartData} property="tvl" />
          ) : (
            <PieSkeleton />
          )}
          {pieChartValues}
        </>
      ) : (
        <div
          sx={{
            flex: "column",
            height: [500, "100%"],
            gap: [24, 40],
            pt: [40, 0],
          }}
        >
          <ChartWrapper />
        </div>
      )}
    </SContainerVertical>
  )
}
