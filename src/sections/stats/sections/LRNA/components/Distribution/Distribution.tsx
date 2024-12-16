import { TotalValue } from "./TotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useState } from "react"
import { ChartWrapper } from "sections/stats/sections/LRNA/components/ChartWrapper/ChartWrapper"
import { useTranslation } from "react-i18next"
import { ChartLabel } from "./ChartLabel"
import { DoughnutChart } from "sections/stats/components/DoughnutChart/DoughnutChart"
import { makePercent } from "./Distribution.utils"
import { DistributionSliceLabel } from "./DistributionSliceLabel"
import { DEPOSIT_CLASS_ID } from "utils/api"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { useTotalIssuances } from "api/totalIssuance"
import { BN_0 } from "utils/constants"
import { useAssets } from "providers/assets"
import BN from "bignumber.js"
import { useOmnipoolDataObserver } from "api/omnipool"

export const Distribution = () => {
  const { t } = useTranslation()
  const { hub } = useAssets()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const meta = hub

  const { data: issuances, isLoading: isIssuanceLoading } = useTotalIssuances()
  const issuance = issuances?.get(meta.id)

  const omnipoolAssets = useOmnipoolDataObserver()
  const hubBalance = omnipoolAssets.hubToken?.balance

  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const isLoading = omnipoolAssets.isLoading

  const outsideOmnipool =
    issuance && hubBalance ? issuance.minus(hubBalance) : undefined

  const outsidePercent = makePercent(outsideOmnipool, issuance ?? BN_0)
  const insidePercent = makePercent(
    hubBalance ? BN(hubBalance) : BN_0,
    issuance ?? BN_0,
  )

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <TotalValue
        title={t("stats.lrna.pie.values.total")}
        data={issuance}
        isLoading={isIssuanceLoading}
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
          data={BN(hubBalance ?? "0")}
          isLoading={omnipoolAssets.isLoading}
          compact={true}
        />
        <TotalValue
          title={t("stats.lrna.pie.values.outside")}
          data={outsideOmnipool}
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
                  label: (
                    <DistributionSliceLabel
                      text={t("stats.lrna.distribution.inside")}
                      symbol={meta.symbol}
                      percentage={insidePercent?.toNumber() ?? 0}
                    />
                  ),
                  percentage: insidePercent?.toNumber() ?? 0,
                  color: "#A6DDFF",
                  name: "in",
                  id: DEPOSIT_CLASS_ID,
                },
                {
                  label: (
                    <DistributionSliceLabel
                      text={t("stats.lrna.distribution.outside")}
                      symbol={meta.symbol}
                      percentage={outsidePercent?.toNumber() ?? 0}
                    />
                  ),
                  percentage: outsidePercent?.toNumber() ?? 0,
                  color: "#2489FF",
                  name: "out",
                  id: DEPOSIT_CLASS_ID,
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
