export const LINKS = {
  home: "/",
  liquidity: "/liquidity",
  trade: "/trade",
  wallet: "/wallet",
  walletAssets: "/wallet/assets",
  walletTransactions: "/wallet/transactions",
  walletVesting: "/wallet/vesting",
  cross_chain: "/cross-chain",
  otc: "/otc",
  stats: "/stats",
  statsOverview: "/stats/overview",
  statsPOL: "/stats/POL",
  statsLRNA: "/stats/LRNA",
}

const isPoolsPageEnabled = import.meta.env.VITE_FF_POOLS_ENABLED === "true"
const isXcmPageEnabled = import.meta.env.VITE_FF_XCM_ENABLED === "true"
const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"

export const MENU_ITEMS = [
  {
    key: "trade",
    translationKey: "header.trade",
    href: LINKS.trade,
    enabled: true,
    external: false,
    mobVisible: true,
    mobOrder: 0,
  },
  {
    key: "pools",
    translationKey: "header.liquidity",
    href: LINKS.liquidity,
    enabled: isPoolsPageEnabled,
    external: false,
    mobVisible: true,
    mobOrder: 2,
  },
  {
    key: "wallet",
    translationKey: "header.wallet",
    href: LINKS.walletAssets,
    enabled: true,
    external: false,
    mobVisible: true,
    mobOrder: 1,
  },
  {
    key: "cross-chain",
    translationKey: "header.xcm",
    href: LINKS.cross_chain,
    enabled: isXcmPageEnabled,
    external: false,
    mobVisible: false,
    mobOrder: 3,
  },
  {
    key: "otc",
    translationKey: "header.otc",
    href: LINKS.otc,
    enabled: isOtcPageEnabled,
    external: false,
    mobVisible: false,
    mobOrder: 4,
  },
] as const

export type TabKeys = (typeof MENU_ITEMS)[number]["key"]
export type TabObject = (typeof MENU_ITEMS)[number]
