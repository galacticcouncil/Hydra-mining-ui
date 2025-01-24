import type { Meta, StoryObj } from "@storybook/react"

import { AssetLogo } from "@/components/AssetLogo"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"
import { Text } from "@/components/Text"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table"

type Story = StoryObj<typeof Table>

export default {
  component: Table,
} satisfies Meta<typeof Table>

type TTableData = {
  id: string
  symbol: string
  price: string
  marketCap: string
  changeIn24h: string
}

const TABLE_DATA: TTableData[] = [
  {
    id: "1",
    symbol: "BTC",
    price: "$102,381.92",
    marketCap: "$1.8T",
    changeIn24h: "-2.34%",
  },
  {
    id: "1027",
    symbol: "ETH",
    price: "$3,012.77",
    marketCap: "$392B",
    changeIn24h: "+3.21%",
  },
  {
    id: "1839",
    symbol: "BNB",
    price: "$687.27",
    marketCap: "$100B",
    changeIn24h: "+1.12%",
  },
  {
    id: "52",
    symbol: "XRP",
    price: "$2.30",
    marketCap: "$132B",
    changeIn24h: "-0.56%",
  },
  {
    id: "5426",
    symbol: "SOL",
    price: "$188.27",
    marketCap: "$91B",
    changeIn24h: "+5.01%",
  },
  {
    id: "6753",
    symbol: "HDX",
    price: "$0.01",
    marketCap: "$38M",
    changeIn24h: "+1.34%",
  },
]

const Template = (args: Story["args"]) => (
  <TableContainer as={Paper}>
    <Table {...args}>
      <TableHeader>
        <TableHead>Symbol</TableHead>
        <TableHead canSort>Price</TableHead>
        <TableHead canSort>Market Cap</TableHead>
        <TableHead canSort>24h %</TableHead>
      </TableHeader>
      <TableBody>
        {TABLE_DATA.map(({ id, symbol, price, marketCap, changeIn24h }) => (
          <TableRow key={id}>
            <TableCell>
              <Flex align="center" gap={8}>
                <AssetLogo
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`}
                />
                <Text fw={600}>{symbol}</Text>
              </Flex>
            </TableCell>
            <TableCell>{price}</TableCell>
            <TableCell>{marketCap}</TableCell>
            <TableCell>
              <Text
                color={
                  changeIn24h.includes("+")
                    ? "successGreen.500"
                    : "utility.red.500"
                }
              >
                {changeIn24h}
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export const Default: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const SmallSize: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const MediumSize: Story = {
  render: Template,
  args: {
    size: "medium",
  },
}

export const LargeSize: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const Hoverable: Story = {
  render: Template,
  args: {
    hoverable: true,
  },
}

export const Borderless: Story = {
  render: Template,
  args: {
    borderless: true,
  },
}
