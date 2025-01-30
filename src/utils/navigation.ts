import PoolsAndFarmsIcon from "assets/icons/PoolsAndFarms.svg?react"
import TradeIcon from "assets/icons/Trade.svg?react"
import TransferIcon from "assets/icons/TransferTabIcon.svg?react"
import WalletIcon from "assets/icons/Wallet.svg?react"
import IconDCA from "assets/icons/navigation/IconDCA.svg?react"
import IconOTC from "assets/icons/navigation/IconOTC.svg?react"
import IconSwap from "assets/icons/navigation/IconSwap.svg?react"
import StatsIcon from "assets/icons/ChartIcon.svg?react"
import StakingIcon from "assets/icons/StakingIcon.svg?react"
import IconBonds from "assets/icons/Bonds.svg?react"
import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import RocketIcon from "assets/icons/RocketIcon.svg?react"
import IconYieldDCA from "assets/icons/YieldDcaIcon.svg?react"
import IconPercentageSquare from "assets/icons/IconPercentageSquare.svg?react"
import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import UserIcon from "assets/icons/UserIcon.svg?react"
import AllPools from "assets/icons/AllPools.svg?react"
import IsolatedPools from "assets/icons/IsolatedPools.svg?react"
import OmniStablepools from "assets/icons/Omnipool&Stablepool.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
import { Search } from "@tanstack/react-location"

export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  myLiquidity: "/liquidity/my-liquidity",
  allPools: "/liquidity/all-pools",
  omnipool: "/liquidity/omnipool-stablepools",
  isolated: "/liquidity/isolated",
  lbp: "/liquidity/lbp",
  swap: "/trade/swap",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  walletVesting: "/wallet/vesting",
  cross_chain: "/cross-chain",
  bridge: "/bridge",
  trade: "/trade",
  otc: "/trade/otc",
  dca: "/trade/dca",
  yieldDca: "/trade/yield-dca",
  bonds: "/trade/bonds",
  bond: "/trade/bond",
  stats: "/stats",
  statsOverview: "/stats/overview",
  statsPOL: "/stats/treasury",
  statsLRNA: "/stats/LRNA",
  statsOmnipool: "/stats/asset",
  staking: "/staking",
  stakingDashboard: "/staking/dashboard",
  stakingGovernance: "/staking/governance",
  referrals: "/referrals",
  borrow: "/borrow",
  borrowDashboard: "/borrow/dashboard",
  borrowMarkets: "/borrow/markets",
  memepad: "/memepad",
  submitTransaction: "/submit-transaction",
  deposit: "/deposit",
  withdraw: "/withdraw",
}

export const MENU_ITEMS = [
  {
    key: "trade",
    href: LINKS.swap,
    Icon: TradeIcon,
    subItems: [
      { key: "trade.swap", href: LINKS.swap, Icon: IconSwap, enabled: true },
      { key: "trade.dca", href: LINKS.dca, Icon: IconDCA, enabled: true },
      {
        key: "trade.yieldDca",
        href: LINKS.yieldDca,
        Icon: IconYieldDCA,
        enabled: true,
      },
      { key: "trade.otc", href: LINKS.otc, Icon: IconOTC, enabled: true },
      {
        key: "trade.bonds",
        href: LINKS.bonds,
        Icon: IconBonds,
        enabled: true,
      },
    ],
    enabled: true,
    external: false,
    mobVisible: true,
    tabVisible: true,
    mobOrder: 1,
    asyncEnabled: false,
  },
  {
    key: "borrow",
    href: LINKS.borrow,
    Icon: IconPercentageSquare,
    enabled: true,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 4,
    asyncEnabled: false,
    subItems: [
      {
        key: "borrow.dashboard",
        href: LINKS.borrowDashboard,
        Icon: UserIcon,
        enabled: true,
      },
      {
        key: "borrow.markets",
        href: LINKS.borrowMarkets,
        Icon: AssetsIcon,
        enabled: true,
      },
    ],
  },
  {
    key: "liquidity",
    href: LINKS.allPools,
    Icon: PoolsAndFarmsIcon,
    enabled: true,
    external: false,
    mobVisible: true,
    tabVisible: true,
    mobOrder: 2,
    asyncEnabled: false,
    subItems: [
      {
        key: "liquidity.myLiquidity",
        href: LINKS.myLiquidity,
        Icon: UserIcon,
        enabled: false,
      },
      {
        key: "liquidity.allPools",
        href: LINKS.allPools,
        Icon: AllPools,
        enabled: true,
      },
      {
        key: "liquidity.omnipoolAndStablepool",
        href: LINKS.omnipool,
        Icon: OmniStablepools,
        enabled: true,
      },
      {
        key: "liquidity.isolated",
        href: LINKS.isolated,
        Icon: IsolatedPools,
        enabled: true,
      },
    ],
  },
  {
    key: "wallet",
    href: LINKS.walletAssets,
    Icon: WalletIcon,
    enabled: true,
    external: false,
    mobVisible: true,
    tabVisible: true,
    mobOrder: 0,
    asyncEnabled: false,
    subItems: [
      {
        key: "wallet.yourAssets",
        href: LINKS.walletAssets,
        Icon: AssetsIcon,
        enabled: true,
      },
      {
        key: "wallet.transactions",
        href: LINKS.walletTransactions,
        Icon: TransferIcon,
        enabled: import.meta.env.VITE_ENV === "development",
      },
      {
        key: "wallet.vesting",
        href: LINKS.walletVesting,
        Icon: PositionsIcon,
        enabled: false,
      },
    ],
  },
  {
    key: "xcm",
    href: LINKS.cross_chain,
    Icon: TransferIcon,
    subItems: undefined,
    enabled: true,
    external: false,
    mobVisible: false,
    tabVisible: false,
    mobOrder: 5,
    asyncEnabled: false,
  },
  {
    key: "stats",
    href: LINKS.statsOverview,
    Icon: StatsIcon,
    subItems: undefined,
    enabled: true,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 3,
    asyncEnabled: false,
  },
  {
    key: "staking",
    href: LINKS.staking,
    Icon: StakingIcon,
    subItems: undefined,
    enabled: true,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 4,
    asyncEnabled: false,
  },
  {
    key: "referrals",
    href: LINKS.referrals,
    Icon: ChainlinkIcon,
    subItems: undefined,
    enabled: true,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 6,
    asyncEnabled: false,
  },
  {
    key: "memepad",
    href: LINKS.memepad,
    Icon: RocketIcon,
    subItems: undefined,
    enabled: true,
    external: false,
    mobVisible: false,
    tabVisible: true,
    mobOrder: 7,
    asyncEnabled: false,
  },
] as const

export type TabKey = (typeof MENU_ITEMS)[number]["key"]
export type TabItem = (typeof MENU_ITEMS)[number]
export type TabSubItem = (typeof MENU_ITEMS)[number]["subItems"]
export type TabItemWithSubItems = TabItem & {
  subItems: NonNullable<TabSubItem>
}

export const resetSearchParams = <T>(searhParams: Partial<Search<T>>) => {
  const persistSearchParams = ["account", "referral"]

  const result: Record<string, T | undefined> = {}

  for (const key in searhParams) {
    result[key] = persistSearchParams.includes(key)
      ? searhParams[key]
      : undefined
  }

  return result
}
