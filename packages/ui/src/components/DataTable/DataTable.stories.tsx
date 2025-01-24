import { useState } from "@storybook/preview-api"
import type { Meta, StoryObj } from "@storybook/react"
import { createColumnHelper } from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"

import { AssetLogo } from "@/components/AssetLogo"
import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Grid } from "@/components/Grid"
import { Input } from "@/components/Input"
import { Paper } from "@/components/Paper"
import { TableContainer } from "@/components/Table"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import { DataTable } from "./DataTable"

type Story = StoryObj<typeof DataTable>

export default {
  component: DataTable,
} as Meta<typeof DataTable>

type TData = ReturnType<typeof createRandomCoin>
const columnHelper = createColumnHelper<TData>()

const formatters = {
  value: new Intl.NumberFormat("en"),
  usd: new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }),
  usdCompact: new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    notation: "compact",
  }),
  percentage: new Intl.NumberFormat("en", {
    style: "percent",
    minimumFractionDigits: 2,
    signDisplay: "exceptZero",
  }),
}

const createRandomCoin = (index: number) => ({
  id: `${index + 1}`,
  symbol: `Coin ${index + 1}`,
  price: Math.random() * 100,
  marketCap: Math.random() * 1000000000,
  changeIn24h: Math.random() * 10 - 1,
  volume: Math.random() * 100000,
  circulatingSupply: Math.random() * 1000000,
  totalSupply: Math.random() * 1000000000,
})

const TABLE_DATA = [
  {
    id: "1",
    symbol: "BTC",
    price: 102381.92,
    marketCap: 1_836_894_875_779,
    changeIn24h: -0.0234,
  },
  {
    id: "1027",
    symbol: "ETH",
    price: 3012.77,
    marketCap: 392_141_215_229,
    changeIn24h: 0.0321,
  },
  {
    id: "1839",
    symbol: "BNB",
    price: 687.27,
    marketCap: 100_330_387_639,
    changeIn24h: 0.0112,
  },
  {
    id: "52",
    symbol: "XRP",
    price: 2.3,
    marketCap: 132_226_504_847,
    changeIn24h: -0.0056,
  },
  {
    id: "5426",
    symbol: "SOL",
    price: 188.27,
    marketCap: 90_964_630_797,
    changeIn24h: 0.0501,
  },
  {
    id: "6753",
    symbol: "HDX",
    price: 0.01005,
    marketCap: 37_540_643,
    changeIn24h: 0.0134,
  },
]

const LARGE_TABLE_DATA = Array.from({ length: 1000 }, (_, index) => ({
  ...createRandomCoin(index),
  ...TABLE_DATA[index],
}))

const TABLE_COLUMNS = [
  columnHelper.accessor("symbol", {
    enableSorting: false,
    header: "Symbol",
    cell: ({ row, getValue }) => {
      return (
        <Flex align="center" gap={8}>
          <AssetLogo
            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${row.original.id}.png`}
          />
          <Text fw={600}>{getValue()}</Text>
        </Flex>
      )
    },
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: ({ getValue }) => formatters.usd.format(getValue()),
    meta: {
      sx: {
        textAlign: "end",
      },
    },
  }),
  columnHelper.accessor("marketCap", {
    header: "Market Cap",
    cell: ({ getValue }) => formatters.usdCompact.format(getValue()),
    meta: {
      visibility: ["tablet", "desktop"],
      sx: {
        textAlign: ["end", "end", "end", "center"],
      },
    },
  }),
  columnHelper.accessor("changeIn24h", {
    header: "24h %",
    meta: {
      visibility: ["desktop"],
      sx: {
        textAlign: "end",
      },
    },
    cell: ({ getValue }) => {
      return (
        <Text color={getValue() > 0 ? "successGreen.500" : "utility.red.500"}>
          {formatters.percentage.format(getValue())}
        </Text>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    meta: {
      sx: {
        textAlign: "end",
      },
    },
    cell: ({ row }) => (
      <Flex gap={8} inline>
        <Button
          size="small"
          onClick={() => alert("SWAP")}
          sx={{ display: ["none", null, null, "inline-flex"] }}
        >
          Swap
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => alert("TRANSFER")}
          sx={{ display: ["none", null, null, "inline-flex"] }}
        >
          Transfer
        </Button>
        {row.getCanExpand() && (
          <button
            onClick={row.getToggleExpandedHandler()}
            sx={{ cursor: "pointer" }}
          >
            {row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
          </button>
        )}
      </Flex>
    ),
  }),
]

const MockTable = (args: Story["args"]) => {
  const [search, setSearch] = useState(args?.globalFilter)
  return (
    <TableContainer as={Paper}>
      {typeof args?.globalFilter === "string" && (
        <Box p={10}>
          <Input
            variant="standalone"
            customSize="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      )}
      <DataTable
        {...args}
        globalFilter={search}
        data={(args?.data as TData[]) || LARGE_TABLE_DATA.slice(0, 6)}
        columns={TABLE_COLUMNS}
        renderSubComponent={({ row }) => (
          <Grid columns={[1, 2, 3]} gap={10} py={20}>
            <Box>
              <Text color={getToken("text.low")}>Volume</Text>
              <Text fw={600} fs="p1">
                {formatters.usdCompact.format(row.original.volume)}
              </Text>
            </Box>
            <Box>
              <Text color={getToken("text.low")}>Circulating supply</Text>
              <Text fw={600} fs="p1">
                {formatters.value.format(row.original.circulatingSupply)}{" "}
                {row.original.symbol}
              </Text>
            </Box>
            <Box>
              <Text color={getToken("text.low")}>Total Supply</Text>
              <Text fw={600} fs="p1">
                {formatters.value.format(row.original.totalSupply)}{" "}
                {row.original.symbol}
              </Text>
            </Box>
          </Grid>
        )}
      />
    </TableContainer>
  )
}

export const Default: Story = {
  render: MockTable,
}

export const WithSkeletons: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    isLoading: true,
    skeletonRowCount: TABLE_DATA.length,
  },
}

export const WithSearch: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    globalFilter: "btc",
  },
}

export const WithExpandableRows: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    expandable: true,
  },
}

export const WithPagination: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    paginated: true,
    pageSize: 6,
    data: LARGE_TABLE_DATA,
  },
}
