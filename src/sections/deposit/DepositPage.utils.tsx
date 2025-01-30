import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain, ParachainAssetData } from "@galacticcouncil/xcm-core"
import BinanceLogo from "assets/icons/BinanceLogo.svg?react"
import CoinbaseLogo from "assets/icons/CoinbaseLogo.svg?react"
import KrakenLogo from "assets/icons/KrakenLogoSmall.svg?react"
import KucoinLogo from "assets/icons/KucoinLogo.svg?react"
import { BigNumber } from "bignumber.js"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useTranslation } from "react-i18next"
import {
  AssetConfig,
  DepositMethod,
  DepositScreen,
} from "sections/deposit/types"
import { required, validAddress } from "utils/validators"
import { z } from "zod"
import { create } from "zustand"

const hydration = chainsMap.get("hydration") as EvmParachain

export const CEX_CONFIG = [
  {
    id: "kraken",
    title: "Kraken",
    icon: KrakenLogo,
    assets: [
      {
        assetId: "5",
        minDeposit: 2,
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "0",
        route: ["hydration"],
        data: hydration.assetsData.get("hdx")!,
      },
    ],
  },
  {
    id: "binance",
    title: "Binance",
    icon: BinanceLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "kucoin",
    title: "KuCoin",
    icon: KucoinLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "coinbase",
    title: "Coinbase",
    icon: CoinbaseLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
    ],
  },
]

export const CEX_MIN_DEPOSIT_VALUES: Record<string, number> = {
  "5": 2,
}

const DEFAULT_CEX_ID = CEX_CONFIG[0].id

type DepositStore = {
  asset: AssetConfig | null
  cexId: string
  depositMethod: DepositMethod | null
  depositedAmount: bigint
  setAsset: (asset: AssetConfig) => void
  setCexId: (cexId: string) => void
  setDepositMethod: (depositMethod: DepositMethod) => void
  setDepositedAmount: (depositedAmount: bigint) => void
  reset: () => void
}

const initialState = {
  asset: null,
  cexId: DEFAULT_CEX_ID,
  depositMethod: null,
  depositedAmount: 22599486481n,
}

export const useDepositStore = create<DepositStore>((set) => ({
  ...initialState,
  setAsset: (asset) => set({ asset }),
  setCexId: (cexId) => set({ cexId }),
  setDepositMethod: (depositMethod) => set({ depositMethod }),
  setDepositedAmount: (depositedAmount) => set({ depositedAmount }),
  reset: () => set(initialState),
}))

export const useDeposit = () => {
  const pagination = useModalPagination()
  const state = useDepositStore()

  const setAsset = (asset: AssetConfig) => {
    state.setAsset(asset)
    pagination.paginateTo(DepositScreen.DepositAsset)
  }

  const setDepositMethod = (method: DepositMethod) => {
    state.setDepositMethod(method)
    pagination.paginateTo(DepositScreen.DepositMethod)
  }

  const setTransfer = () => {
    pagination.paginateTo(DepositScreen.Transfer)
  }

  const setSuccess = () => {
    pagination.paginateTo(DepositScreen.Success)
  }

  const reset = () => {
    state.reset()
    pagination.paginateTo(DepositScreen.Select)
  }

  return {
    ...state,
    ...pagination,
    reset,
    setAsset,
    setDepositMethod,
    setTransfer,
    setSuccess,
  }
}

export const createCexWithdrawalUrl = (
  cexId: string,
  assetData: ParachainAssetData,
) => {
  const symbol = assetData.asset.originSymbol.toUpperCase()
  switch (cexId) {
    case "kraken":
      const network = symbol === "DOT" ? "Polkadot" : "Hydration"
      const method = symbol === "DOT" ? "Polkadot" : "HydraDX Network"
      return encodeURI(
        `https://www.kraken.com/c/funding/withdraw?asset=${symbol}&network=${network}&method=${method}`,
      )
    case "binance":
      return encodeURI(
        `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${symbol}`,
      )
    case "kucoin":
      return encodeURI(`https://www.kucoin.com/assets/withdraw/${symbol}`)
    case "coinbase":
      return `https://www.coinbase.com`
    default:
      return ""
  }
}

export const useTransferSchema = ({
  min,
  max,
  symbol,
  decimals,
}: {
  min: BigNumber
  max: BigNumber
  symbol: string
  decimals: number
}) => {
  const { t } = useTranslation()

  const maxBalance = z.string().refine(
    (value) =>
      Number.isFinite(decimals) &&
      BigNumber(value).lte(max.shiftedBy(-decimals)),
    t("xcm.transfer.error.maxTransferable", {
      value: max,
      fixedPointScale: decimals,
      symbol,
    }),
  )

  const minBalance = z.string().refine(
    (value) =>
      Number.isFinite(decimals) &&
      BigNumber(value).gte(min.shiftedBy(-decimals)),
    t("xcm.transfer.error.minTransferable", {
      value: min,
      fixedPointScale: decimals,
      symbol,
    }),
  )

  return z.object({
    amount: required.pipe(maxBalance).pipe(minBalance),
    address: validAddress,
  })
}
