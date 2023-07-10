import { TotalValue } from "./TotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useState } from "react"
import { SContainerVertical } from "../../StatsLRNA.styled"
import { ChartWrapper } from "../ChartWrapper/ChartWrapper"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { ChartLabel } from "./ChartLabel"
import { DoughnutChart } from "../../../../components/DoughnutChart/DoughnutChart"

export const Distribution = () => {
  const isLoading = false
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <TotalValue
        title={t("stats.lrna.pie.values.total")}
        data={new BigNumber(8301874)}
        isLoading={isLoading}
      />
      <div
        sx={{
          flex: ["row", "column"],
          justify: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <TotalValue
          title={t("stats.lrna.pie.values.inside")}
          data={new BigNumber(4200000)}
          isLoading={isLoading}
          compact={true}
        />
        <TotalValue
          title={t("stats.lrna.pie.values.outside")}
          data={new BigNumber(4200000)}
          isLoading={isLoading}
          compact={true}
        />
      </div>
    </div>
  )

  return (
    <SContainerVertical sx={{ width: ["100%", "fit-content"], p: [20, 40] }}>
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        !isLoading ? (
          <>
            <DoughnutChart
              slices={[
                {
                  label: <div sx={{ color: "white" }}>in label todo</div>,
                  percentage: 40,
                  color: "#A6DDFF",
                  name: "in",
                },
                {
                  label: <div sx={{ color: "white" }}>out label todo</div>,
                  percentage: 60,
                  color: "#2489FF",
                  name: "out",
                },
              ]}
              label={ChartLabel}
            />
            {pieChartValues}
          </>
        ) : (
          <>
            <PieSkeleton />
            {pieChartValues}
          </>
        )
      ) : (
        <ChartWrapper />
      )}
    </SContainerVertical>
  )
}
