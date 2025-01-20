import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { AssetSkeleton } from "components/Skeleton/AssetSkeleton"
import { CellSkeleton } from "components/Skeleton/CellSkeleton"

export const useOmnipoolAssetsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const columnVisibility: VisibilityState = {
    symbol: true,
    pol: true,
  }

  const columns = useMemo(
    () => [
      display({
        id: "symbol",
        header: t("stats.pol.table.assets.header.asset"),
        cell: () => <AssetSkeleton enableAnimation={enableAnimation} />,
      }),
      display({
        id: "pol",
        header: t("stats.pol.table.assets.header.pol"),
        cell: () => <CellSkeleton enableAnimation={enableAnimation} />,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableAnimation],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  })
}

const mockData = [1, 2, 3, 4, 5]
