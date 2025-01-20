import {
  NotifyOnChangeProps,
  useQueries,
  useQuery,
} from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { TradeRouter } from "@galacticcouncil/sdk"
import { BN_1, BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { Maybe } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"

const TRACKED_PROPS: NotifyOnChangeProps = ["data", "isLoading"]

export const useNewSpotPrice = (assetA?: string, assetB?: string) => {
  const { tradeRouter, isLoaded } = useRpcProvider()
  const tokenIn = assetA ?? ""
  const tokenOut = assetB ?? ""

  const routerInitialized = Object.keys(tradeRouter).length > 0

  return useQuery(
    QUERY_KEYS.newSpotPriceLive(tokenIn, tokenOut),
    getNewSpotPrice(tradeRouter, tokenIn, tokenOut),
    { enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded },
  )
}

export const useNewSpotPrices = (
  assetsIn: (string | undefined)[],
  assetOut?: string,
  noRefresh?: boolean,
) => {
  const { tradeRouter, isLoaded } = useRpcProvider()

  const assets = new Set(assetsIn.filter((a): a is string => !!a))

  const tokenOut = assetOut ?? ""

  const routerInitialized = Object.keys(tradeRouter).length > 0

  return useQueries({
    queries: Array.from(assets).map((tokenIn) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.newSpotPrice(tokenIn, tokenOut)
        : QUERY_KEYS.newSpotPriceLive(tokenIn, tokenOut),
      queryFn: getNewSpotPrice(tradeRouter, tokenIn, tokenOut),
      notifyOnChangeProps: TRACKED_PROPS,
      enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded,
    })),
  })
}

export const useSpotPrice = (
  assetA: Maybe<u32 | string>,
  assetB: Maybe<u32 | string>,
) => {
  const { tradeRouter, isLoaded } = useRpcProvider()
  const tokenIn = assetA?.toString() ?? ""
  const tokenOut = assetB?.toString() ?? ""

  const routerInitialized = Object.keys(tradeRouter).length > 0

  return useQuery(
    QUERY_KEYS.spotPriceLive(tokenIn, tokenOut),
    getSpotPrice(tradeRouter, tokenIn, tokenOut),
    { enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded },
  )
}

export const useSpotPrices = (
  assetsIn: Maybe<u32 | string>[],
  assetOut: Maybe<u32 | string>,
  noRefresh?: boolean,
) => {
  const { tradeRouter, isLoaded } = useRpcProvider()

  const assets = new Set(
    assetsIn.filter((a): a is u32 | string => !!a).map((a) => a.toString()),
  )

  const tokenOut = assetOut?.toString() ?? ""

  const routerInitialized = Object.keys(tradeRouter).length > 0

  return useQueries({
    queries: Array.from(assets).map((tokenIn) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.spotPrice(tokenIn, tokenOut)
        : QUERY_KEYS.spotPriceLive(tokenIn, tokenOut),
      queryFn: getSpotPrice(tradeRouter, tokenIn, tokenOut),
      enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded,
    })),
  })
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    const tokenInParam = A_TOKEN_UNDERLYING_ID_MAP[tokenIn] ?? tokenIn
    const tokenOutParam = A_TOKEN_UNDERLYING_ID_MAP[tokenOut] ?? tokenOut
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut || tokenInParam === tokenOutParam)
      return { tokenIn, tokenOut, spotPrice: BN_1 }

    // error replies are valid in case token has no spot price
    let spotPrice = BN_NAN
    try {
      const res = await tradeRouter.getBestSpotPrice(
        tokenInParam,
        tokenOutParam,
      )
      if (res) {
        spotPrice = res.amount.div(BN_10.pow(res.decimals))
      }
    } catch (e) {}
    return { tokenIn, tokenOut, spotPrice }
  }

export const getNewSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    const tokenInParam = A_TOKEN_UNDERLYING_ID_MAP[tokenIn] ?? tokenIn
    const tokenOutParam = A_TOKEN_UNDERLYING_ID_MAP[tokenOut] ?? tokenOut
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut || tokenInParam === tokenOutParam)
      return { tokenIn, tokenOut, spotPrice: "1" }

    // error replies are valid in case token has no spot price
    let spotPrice: string = "NaN"

    try {
      const res = await tradeRouter.getBestSpotPrice(
        tokenInParam,
        tokenOutParam,
      )
      if (res) {
        spotPrice = res.amount
          .shiftedBy(-res.decimals)
          .decimalPlaces(10)
          .toString()
      }
    } catch (e) {}
    return { tokenIn, tokenOut, spotPrice }
  }

export type SpotPrice = {
  tokenIn: string
  tokenOut: string
  spotPrice: BN
}
