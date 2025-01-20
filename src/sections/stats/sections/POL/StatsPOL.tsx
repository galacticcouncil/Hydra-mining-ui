import { useMedia } from "react-use"
import { theme } from "theme"
import { ChartsWrapper } from "./components/ChartsWrapper/ChartsWrapper"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { useTreasuryAssets } from "sections/stats/StatsPage.utils"
import { SContainerVertical } from "sections/stats/StatsPage.styled"

import { Spacer } from "components/Spacer/Spacer"
import { StatsTabs } from "sections/stats/components/tabs/StatsTabs"
import { TreasuryTable } from "./components/OmnipoolAssetsTableWrapper/TreasuryTable"

export const StatsPOL = () => {
  const {
    assets,
    bondAssets,
    liquidityPositions,
    isLoading,
    total,
    POLMultiplier,
    totalVolume,
  } = useTreasuryAssets()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <>
      <Spacer size={[20, 30]} />
      <StatsTabs />
      <Spacer size={30} />

      <div sx={{ flex: "column", gap: [24, 50] }}>
        <div sx={{ flex: "row", gap: 20 }}>
          <PieWrapper
            data={[...(assets ?? [])].reverse()}
            isLoading={isLoading}
            POLMultiplier={POLMultiplier}
            totalVolume={totalVolume}
            totalPol={total ?? "0"}
          />
          {isDesktop && (
            <SContainerVertical
              sx={{
                p: 24,
                justify: "space-between",
                flexGrow: 3,
                gap: 20,
              }}
            >
              <ChartsWrapper POLMultiplier={POLMultiplier} />
            </SContainerVertical>
          )}
        </div>
        <TreasuryTable
          title={"Treasury assets"}
          data={assets ?? []}
          isLoading={isLoading}
        />

        <TreasuryTable
          title={"Liquidity positions"}
          data={liquidityPositions}
          isLoading={isLoading}
        />

        <TreasuryTable
          title={"Bonds"}
          data={bondAssets ?? []}
          isLoading={isLoading}
        />
      </div>
    </>
  )
}
