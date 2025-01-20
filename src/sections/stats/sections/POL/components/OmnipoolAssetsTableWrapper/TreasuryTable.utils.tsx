import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { TTreasuryAsset } from "sections/stats/StatsPage.utils"
import { useMemo, useState } from "react"
import BigNumber from "bignumber.js"
import { WalletAssetsTableBalance } from "sections/wallet/assets/table/data/WalletAssetsTableData"
import {
  defaultPaginationState,
  useTablePagination,
} from "components/Table/TablePagination"

export const useTreasuryTable = (data: TTreasuryAsset[]) => {
  const { accessor } = createColumnHelper<TTreasuryAsset>()
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useTablePagination()

  const columnVisibility: VisibilityState = {
    symbol: true,
    valueDisplay: true,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "symbol",
        header: t("stats.pol.table.assets.header.asset"),
        sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
        cell: ({ row }) => (
          <div
            sx={{
              flex: "row",
              gap: 8,
              align: "center",
            }}
          >
            <MultipleAssetLogo size={[26, 30]} iconId={row.original.iconIds} />
            <Text fs={[14, 16]} color="white">
              {row.original.symbol}
            </Text>
          </div>
        ),
      }),
      accessor("valueDisplay", {
        id: "treasury",
        header: t("stats.pol.table.assets.header.pol"),
        sortingFn: (a, b) =>
          BigNumber(a.original.valueDisplay).gt(b.original.valueDisplay)
            ? 1
            : -1,
        cell: ({ row }) => (
          <WalletAssetsTableBalance
            balance={row.original.value}
            balanceDisplay={row.original.valueDisplay}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, pagination },
    onSortingChange: (data) => {
      setSorting(data)
      setPagination(defaultPaginationState)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  })
}
