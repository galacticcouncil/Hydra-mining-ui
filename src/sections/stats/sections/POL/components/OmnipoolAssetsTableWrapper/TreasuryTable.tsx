import {
  StatsTableContainer,
  StatsTableTitle,
  Table,
  TableBodyContent,
  TableData,
  TableHeaderContent,
  TableRowStats,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useTreasuryTable } from "./TreasuryTable.utils"
import { TTreasuryAsset } from "sections/stats/StatsPage.utils"
import { TableSortHeader } from "components/Table/Table"
import { flexRender } from "@tanstack/react-table"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTableSkeleton"
import { useOmnipoolAssetsTableSkeleton } from "./OmnipoolAssetsTableSkeleton.utils"
import { TablePagination } from "components/Table/TablePagination"
import { useMedia } from "react-use"
import { theme } from "theme"

export const TreasuryTable = ({
  title,
  data,
  isLoading,
}: {
  title: string
  data: TTreasuryAsset[]
  isLoading: boolean
}) => {
  const table = useTreasuryTable(data)
  const skeleton = useOmnipoolAssetsTableSkeleton()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (isLoading || !data.length) {
    return <OmnipoolAssetsTableSkeleton table={skeleton} />
  }

  return (
    <StatsTableContainer>
      <StatsTableTitle>
        <Text fs={[15, 19]} lh={20} color="white" font="GeistMono">
          {title}
        </Text>
      </StatsTableTitle>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRowStats key={hg.id} header>
              {hg.headers.map((header) => (
                <TableSortHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onSort={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableSortHeader>
              ))}
            </TableRowStats>
          ))}
        </TableHeaderContent>
        <TableBodyContent>
          {table.getRowModel().rows.map((row, i) => (
            <TableRowStats key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableData
                  key={cell.id}
                  css={{
                    "&:last-of-type": {
                      paddingRight: isDesktop ? 32 : 12,
                    },
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableData>
              ))}
            </TableRowStats>
          ))}
        </TableBodyContent>
      </Table>
      <TablePagination table={table} />
    </StatsTableContainer>
  )
}
