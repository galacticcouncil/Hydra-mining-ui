import { u32 } from "@polkadot/types-codec"
import { useQuery } from "@tanstack/react-query"
import {
  useNewSpotPrice,
  useNewSpotPrices,
  useSpotPrice,
  useSpotPrices,
} from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { STABLECOIN_SYMBOL } from "./constants"
import { QUERY_KEYS } from "./queryKeys"
import { isNotNil } from "./helpers"
import { TShareToken, useAssets } from "providers/assets"
import { useTotalIssuances } from "api/totalIssuance"
import { useXYKSDKPools } from "api/xyk"

type Props = { id: string; amount: BigNumber }

export const useDisplayValue = (props: Props) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(props.id, displayAsset.id)

  const isLoading = spotPrice.isInitialLoading

  const symbol = displayAsset.symbol
  const amount = useMemo(() => {
    if (!displayAsset.id || !spotPrice.data || spotPrice.data.spotPrice.isNaN())
      return undefined

    return props.amount.times(spotPrice.data.spotPrice)
  }, [props.amount, displayAsset, spotPrice.data])

  return { amount, symbol, isLoading }
}

export const useNewDisplayPrice = (id?: string) => {
  const displayAsset = useDisplayAssetStore()
  const { data: spotPrice, isInitialLoading: isSpotPriceInitialLoading } =
    useNewSpotPrice(id?.toString(), displayAsset.id)

  const { data: usdPrice, isInitialLoading: isUsdPriceInitialLoading } =
    useCoingeckoUsdPrice()

  const isLoading = isSpotPriceInitialLoading || isUsdPriceInitialLoading
  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.isRealUSD && usdPrice)
      return spotPrice
        ? {
            ...spotPrice,
            spotPrice: BigNumber(spotPrice.spotPrice)
              .times(usdPrice)
              .toString(),
          }
        : undefined

    return spotPrice
  }, [displayAsset.isRealUSD, isLoading, spotPrice, usdPrice])

  return { data, isLoading, isInitialLoading: isLoading }
}

export const useNewDisplayPrices = (ids: string[], noRefresh?: boolean) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrices = useNewSpotPrices(ids, displayAsset.id, noRefresh)
  const { data: usdPrice, isInitialLoading: isUsdPriceInitialLoading } =
    useCoingeckoUsdPrice()

  const isLoading =
    spotPrices.some((q) => q.isInitialLoading) || isUsdPriceInitialLoading

  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.isRealUSD && usdPrice)
      return spotPrices.map((sp) =>
        sp.data
          ? {
              ...sp.data,
              spotPrice: BigNumber(sp.data.spotPrice)
                .times(usdPrice)
                .toString(),
            }
          : undefined,
      )

    return spotPrices.map((sp) => sp.data)
  }, [displayAsset.isRealUSD, isLoading, spotPrices, usdPrice])

  return { data, isLoading, isInitialLoading: isLoading }
}

export const useDisplayPrice = (id: string | u32 | undefined) => {
  const displayAsset = useDisplayAssetStore()
  const { data: spotPrice, isInitialLoading: isSpotPriceInitialLoading } =
    useSpotPrice(id, displayAsset.id)
  const { data: usdPrice, isInitialLoading: isUsdPriceInitialLoading } =
    useCoingeckoUsdPrice()

  const isLoading = isSpotPriceInitialLoading || isUsdPriceInitialLoading
  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.isRealUSD && usdPrice)
      return spotPrice
        ? {
            ...spotPrice,
            spotPrice: spotPrice.spotPrice.times(usdPrice),
          }
        : undefined

    return spotPrice
  }, [displayAsset.isRealUSD, isLoading, spotPrice, usdPrice])

  return { data, isLoading, isInitialLoading: isLoading }
}

//TODO: mb create a hook for a single share token
export const useDisplayShareTokenPrice = (ids: string[]) => {
  const { getShareTokens, getAssetWithFallback } = useAssets()
  const pools = getShareTokens(ids) as TShareToken[]

  const { data: xykPools = [], isLoading: isPoolsLoading } = useXYKSDKPools()
  const { data: issuances, isLoading: isIssuanceLoading } = useTotalIssuances()

  const shareTokensTvl = useMemo(() => {
    return pools
      .map((shareToken) => {
        const { poolAddress } = shareToken ?? {}

        if (!poolAddress) return undefined

        const pool = xykPools.find((pool) => poolAddress === pool.address)

        if (!pool) return undefined

        const { tokens } = pool
        const [assetA] = tokens

        if (!assetA) return undefined
        const { balance, decimals, id } = assetA

        const assetABalance = BigNumber(balance).shiftedBy(-decimals)

        const tvl = assetABalance.multipliedBy(2)

        return {
          spotPriceId: id,
          tvl,
          shareTokenId: shareToken.id,
        }
      })
      .filter(isNotNil)
  }, [pools, xykPools])

  const { data: spotPrices, isInitialLoading: isSpotPriceLoading } =
    useDisplayPrices(
      shareTokensTvl.map((shareTokenTvl) => shareTokenTvl.spotPriceId),
    )

  const isLoading = isIssuanceLoading || isPoolsLoading || isSpotPriceLoading

  const data = useMemo(() => {
    return shareTokensTvl
      .map((shareTokenTvl) => {
        const spotPrice = spotPrices?.find(
          (spotPrice) => spotPrice?.tokenIn === shareTokenTvl.spotPriceId,
        )

        const tvlDisplay = shareTokenTvl.tvl.multipliedBy(
          spotPrice?.spotPrice ?? 1,
        )

        const totalIssuance = issuances?.get(shareTokenTvl.shareTokenId)

        const shareTokenMeta = getAssetWithFallback(shareTokenTvl.shareTokenId)

        if (!totalIssuance || !spotPrice?.tokenOut) return undefined

        const shareTokenDisplay = tvlDisplay
          .div(totalIssuance.shiftedBy(-shareTokenMeta.decimals))
          .toFixed(6)

        return {
          tokenIn: shareTokenTvl.shareTokenId,
          tokenOut: spotPrice.tokenOut,
          spotPrice: shareTokenDisplay,
        }
      })
      .filter(isNotNil)
  }, [getAssetWithFallback, issuances, shareTokensTvl, spotPrices])

  return { data, isLoading, isInitialLoading: isLoading }
}

export const useDisplayPrices = (
  ids: (string | u32)[],
  noRefresh?: boolean,
) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrices = useSpotPrices(ids, displayAsset.id, noRefresh)
  const { data: usdPrice, isInitialLoading: isUsdPriceInitialLoading } =
    useCoingeckoUsdPrice()

  const isLoading =
    spotPrices.some((q) => q.isInitialLoading) || isUsdPriceInitialLoading

  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.isRealUSD && usdPrice)
      return spotPrices.map((sp) =>
        sp.data
          ? { ...sp.data, spotPrice: sp.data.spotPrice.times(usdPrice) }
          : undefined,
      )

    return spotPrices.map((sp) => sp.data)
  }, [displayAsset.isRealUSD, isLoading, spotPrices, usdPrice])

  return { data, isLoading, isInitialLoading: isLoading }
}

type Asset = {
  id: string | undefined
  symbol: string
  isRealUSD: boolean
  isStableCoin: boolean
  isDollar?: boolean
  stableCoinId: string | undefined
}
export type DisplayAssetStore = Asset & {
  update: (asset: Asset) => void
}

export const useDisplayAssetStore = create<DisplayAssetStore>()(
  persist(
    (set) => ({
      id: undefined,
      stableCoinId: undefined,
      symbol: "$",
      isDollar: true,
      isRealUSD: false,
      isStableCoin: true,
      update: (value) =>
        set({ ...value, isDollar: value.isRealUSD || value.isStableCoin }),
    }),
    { name: "hdx-display-asset", version: 1 },
  ),
)

export const useCoingeckoUsdPrice = () => {
  const displayAsset = useDisplayAssetStore()

  return useQuery(QUERY_KEYS.coingeckoUsd, getCoingeckoSpotPrice, {
    enabled: displayAsset.isRealUSD,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  })
}

export const getCoingeckoSpotPrice = async () => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${STABLECOIN_SYMBOL.toLowerCase()}&vs_currencies=usd`,
  )
  const json = await res.json()
  return json[STABLECOIN_SYMBOL.toLowerCase()].usd
}

type simplifiedAsset = {
  id: string | u32
  name: string
  symbol: string
}

export const useAssetPrices = (
  assets: simplifiedAsset[],
  noRefresh?: boolean,
) => {
  const displayAsset = useDisplayAssetStore()
  const ids = assets.map((asset) => asset.id)
  const spotPrices = useSpotPrices(ids, displayAsset.id, noRefresh)
  const coingeckoAssetNames = spotPrices
    .filter((asset) => asset?.data?.spotPrice.isNaN())
    .map((asset) => {
      const matchingAsset = assets.find((a) => a.id === asset?.data?.tokenIn)
      return { id: matchingAsset?.id, name: matchingAsset?.name }
    })
    .filter((asset): asset is simplifiedAsset => asset !== undefined)

  const coingeckoPrices = useCoingeckoPrice(coingeckoAssetNames)

  const updatedSpotPrices = useMemo(() => {
    return spotPrices.map((spotPrices, index) => {
      if (spotPrices.data && spotPrices.data.spotPrice.isNaN()) {
        const coingeckoPrice = coingeckoPrices.data?.[spotPrices.data.tokenIn]

        if (coingeckoPrice) {
          return {
            ...spotPrices,
            data: {
              ...spotPrices.data,
              // @ts-ignore
              spotPrice: new BigNumber(coingeckoPrice),
            },
          }
        }
      }
      return spotPrices
    })
  }, [spotPrices, coingeckoPrices.data])

  return updatedSpotPrices
}

export const useCoingeckoPrice = (assets: simplifiedAsset[]) => {
  return useQuery(
    [QUERY_KEYS.coingeckoUsd, assets.map((asset) => asset.name)],
    async () => {
      const prices = await getCoingeckoAssetPrices(assets)
      return prices
    },
    {
      enabled: assets.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1000 * 60 * 60, // 1h
    },
  )
}

export const getCoingeckoAssetPrices = async (
  assets: simplifiedAsset[],
): Promise<{ [key: string]: number }> => {
  const formattedAssetNames = assets
    .map((asset) => {
      let formattedName = asset.name.toLowerCase()
      if (asset.name.includes(" ")) {
        formattedName = asset.name.replace(/\s+/g, "-").toLowerCase()
      } else if (asset.name.toLowerCase() === "phala") {
        formattedName = "pha"
      } else if (asset.name.toLowerCase() === "glimmer") {
        formattedName = "moonbeam"
      }
      return formattedName
    })
    .join(",")

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${formattedAssetNames}&vs_currencies=usd`
  const res = await fetch(url)
  const json = await res.json()

  const pricesById: { [key: string]: number } = assets.reduce(
    (acc, asset) => {
      const formattedName = asset.name.toLowerCase().replace(/\s+/g, "-")
      acc[asset.id.toString()] = json[formattedName]?.usd || undefined
      return acc
    },
    {} as { [key: string]: number },
  )

  return pricesById
}
