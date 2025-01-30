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
import { useMemo, useState } from "react"
import { WalletAssetsTableBalance } from "sections/wallet/assets/table/data/WalletAssetsTableData"
import { WalletAssetsTableActions } from "sections/wallet/assets/table/actions/WalletAssetsTableActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { ButtonTransparent } from "components/Button/Button"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { AssetsTableData } from "./data/WalletAssetsTableData.utils"
import {
  defaultPaginationState,
  useTablePagination,
} from "components/Table/TablePagination"
import { bnSort } from "utils/helpers"

export const useAssetsTable = (
  data: AssetsTableData[],
  actions: { onTransfer: (assetId: string) => void },
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<AssetsTableData>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useTablePagination()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    transferable: true,
    total: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "name",
        //width percentage of column
        size: 26,
        header: isDesktop
          ? t("wallet.assets.table.header.name")
          : t("selectAssets.asset"),
        sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
        cell: ({ row }) => <AssetTableName {...row.original} />,
      }),
      accessor("transferable", {
        id: "transferable",
        header: t("wallet.assets.table.header.transferable"),
        sortingFn: (a, b) =>
          bnSort(
            a.original.transferableDisplay,
            b.original.transferableDisplay,
          ),
        cell: ({ row }) => (
          <div
            sx={{
              flex: "row",
              gap: 1,
              align: "center",
              justify: ["end", "start"],
            }}
          >
            <WalletAssetsTableBalance
              balance={row.original.transferable}
              balanceDisplay={row.original.transferableDisplay}
            />
            {!isDesktop && (
              <ButtonTransparent css={{ color: theme.colors.iconGray }}>
                <Icon
                  sx={{ color: "darkBlue300" }}
                  icon={<ChevronRightIcon />}
                />
              </ButtonTransparent>
            )}
          </div>
        ),
      }),
      accessor("total", {
        id: "total",
        header: t("wallet.assets.table.header.total"),
        sortingFn: (a, b) =>
          bnSort(a.original.totalDisplay, b.original.totalDisplay),
        cell: ({ row }) => (
          <WalletAssetsTableBalance
            balance={row.original.total}
            balanceDisplay={row.original.totalDisplay}
          />
        ),
      }),
      display({
        id: "actions",
        //width percentage of column
        size: 30,
        cell: ({ row }) => (
          <WalletAssetsTableActions
            toggleExpanded={row.toggleSelected}
            isExpanded={row.getIsSelected()}
            onTransferClick={() => actions.onTransfer(row.original.id)}
            asset={row.original}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop],
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
