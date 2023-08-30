import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { Button, ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { useTranslation } from "react-i18next"
import { useAssetMeta } from "api/assetMeta"
import { formatDate } from "utils/formatting"
import { AssetTableName } from "components/AssetTableName/AssetTableName"

export type BondTableItem = {
  assetId: string
  maturity?: number
  balance?: string
  price: string
}

export type Config = {
  showTransactions?: boolean
}

const BondCell = ({
  assetId,
  maturity,
}: Pick<BondTableItem, "assetId" | "maturity">) => {
  const { t } = useTranslation()
  const meta = useAssetMeta(assetId)

  const formattedMaturity = maturity
    ? formatDate(new Date(maturity), "yyyyMMdd")
    : ""

  return (
    <AssetTableName
      id={assetId}
      name={`${meta.data?.symbol}B-${formattedMaturity}`}
      symbol={`${meta.data?.symbol} ${t("bond")}`}
    />
  )
}

export const useActiveBondsTable = (data: BondTableItem[], config: Config) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<BondTableItem>()

  const columns = useMemo(
    () => [
      accessor("assetId", {
        header: t("bonds.table.bond"),
        cell: ({ getValue, row }) =>
          getValue() ? (
            <BondCell assetId={getValue()} maturity={row.original.maturity} />
          ) : null,
      }),
      accessor("maturity", {
        header: () => (
          <div sx={{ textAlign: "right" }}>{t("bonds.table.maturity")}</div>
        ),
        cell: ({ getValue }) => {
          const value = getValue()

          return value !== undefined ? (
            <Text color="white" tAlign="right">
              {formatDate(new Date(value), "dd/MM/yyyy")}
            </Text>
          ) : null
        },
      }),
      accessor("balance", {
        header: () => (
          <div sx={{ textAlign: "center" }}>{t("bonds.table.balance")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {getValue()}
          </Text>
        ),
      }),
      accessor("price", {
        header: () => (
          <div sx={{ textAlign: "center" }}>{t("bonds.table.price")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {getValue()}
          </Text>
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <>
            {!!row.original.maturity &&
              row.original.maturity <= new Date().getTime() && (
                <Button
                  size="small"
                  sx={{ mr: config.showTransactions ? 0 : 14 }}
                >
                  {t("bonds.table.claim")}
                </Button>
              )}
            {config.showTransactions && (
              <ButtonTransparent
                onClick={() => row.toggleSelected()}
                css={{
                  color: theme.colors.iconGray,
                  opacity: row.getIsSelected() ? "1" : "0.5",
                  transform: row.getIsSelected() ? "rotate(180deg)" : undefined,
                }}
              >
                <ChevronDownIcon />
              </ButtonTransparent>
            )}
          </>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.showTransactions],
  )

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
