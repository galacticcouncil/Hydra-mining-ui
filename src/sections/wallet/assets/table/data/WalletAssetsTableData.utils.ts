import { u32 } from "@polkadot/types"
import { PalletBalancesAccountData } from "@polkadot/types/lookup"
import { getAccountBalances } from "api/accountBalances"
import { useAssetTable } from "api/assetDetails"
import { getTokenLock } from "api/balances"
import { SpotPrice } from "api/spotPrice"
import BN from "bignumber.js"
import { useMemo } from "react"
import { AssetsTableData } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_10 } from "utils/constants"

import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math-omnipool"
import { useApiIds } from "api/consts"
import { useHubAssetTradability, useOmnipoolAssets } from "api/omnipool"
import { useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { TToken } from "api/assetDetails"
import { TStableSwap } from "api/assetDetails"

export const useAssetsTableData = (isAllAssets: boolean) => {
  const { assets } = useRpcProvider()
  const myTableData = useAssetTable()
  const spotPrices = useDisplayPrices(
    myTableData.data?.acceptedTokens.map((t) => t.id) ?? [],
  )

  const data = useMemo(() => {
    if (!myTableData.data || !spotPrices.data) return []

    const {
      balances,
      tradeAssets,
      accountTokenId,
      acceptedTokens,
      tokenLocks,
      apiIds,
      omnipoolAssets,
      hubAssetTradability,
    } = myTableData.data

    const allAssets = [...assets.tokens, ...assets.stableswap]

    const assetsBalances = getAssetsBalances(
      balances.balances,
      spotPrices.data.filter(isNotNil),
      allAssets,
      tokenLocks,
      balances.native,
    )

    const assetsToShow = isAllAssets
      ? allAssets
      : allAssets.filter((asset) =>
          acceptedTokens.some(
            (acceptedToken) => acceptedToken.id === asset.id.toString(),
          ),
        )

    const results = omnipoolAssets.map((asset) => {
      const id = asset.id.toString()
      const bits = asset.data.tradable.bits.toNumber()
      const canBuy = is_buy_allowed(bits)
      const canSell = is_sell_allowed(bits)
      const canAddLiquidity = is_add_liquidity_allowed(bits)
      const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

      return { id, canBuy, canSell, canAddLiquidity, canRemoveLiquidity }
    })

    const hubBits = hubAssetTradability.bits.toNumber()
    const canBuyHub = is_buy_allowed(hubBits)
    const canSellHub = is_sell_allowed(hubBits)
    const canAddLiquidityHub = is_add_liquidity_allowed(hubBits)
    const canRemoveLiquidityHub = is_remove_liquidity_allowed(hubBits)
    const hubResult = {
      id: apiIds.hubId,
      canBuy: canBuyHub,
      canSell: canSellHub,
      canAddLiquidity: canAddLiquidityHub,
      canRemoveLiquidity: canRemoveLiquidityHub,
    }

    const assetsTradability = [...results, hubResult]

    const assetsTableData = assetsToShow.map((assetValue) => {
      const inTradeRouter =
        tradeAssets.find((i) => i.id === assetValue.id?.toString()) != null

      const isPaymentFee = assetValue.id?.toString() === accountTokenId

      const couldBeSetAsPaymentFee = acceptedTokens.some(
        (currency) =>
          currency.id === assetValue.id?.toString() &&
          currency.id !== accountTokenId &&
          currency.accepted,
      )

      const balance = assetsBalances.find(
        (b) => b.id.toString() === assetValue.id.toString(),
      )

      const { id, symbol, name } = assetValue

      const tradabilityData = assetsTradability.find(
        (t) => t.id === assetValue.id.toString(),
      )

      const tradability = {
        canBuy: !!tradabilityData?.canBuy,
        canSell: !!tradabilityData?.canSell,
        canAddLiquidity: !!tradabilityData?.canAddLiquidity,
        canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
        inTradeRouter,
      }

      return {
        id,
        symbol,
        name,
        isPaymentFee,
        couldBeSetAsPaymentFee,
        transferable: balance?.transferable ?? BN_0,
        transferableDisplay: balance?.transferableDisplay ?? BN_0,
        total: balance?.total ?? BN_0,
        totalDisplay: balance?.totalDisplay ?? BN_0,
        lockedMax: balance?.lockedMax ?? BN_0,
        lockedMaxDisplay: balance?.lockedMaxDisplay ?? BN_0,
        lockedVesting: balance?.lockedVesting ?? BN_0,
        lockedVestingDisplay: balance?.lockedVestingDisplay ?? BN_0,
        lockedDemocracy: balance?.lockedDemocracy ?? BN_0,
        lockedDemocracyDisplay: balance?.lockedDemocracyDisplay ?? BN_0,
        reserved: balance?.reserved ?? BN_0,
        reservedDisplay: balance?.reservedDisplay ?? BN_0,
        tradability,
      }
    })

    return assetsTableData
      .filter((x): x is AssetsTableData => x !== null)
      .sort((a, b) => {
        // native asset first
        if (a.id === NATIVE_ASSET_ID) return -1

        if (!b.transferable.eq(a.transferable))
          return b.transferable.minus(a.transferable).toNumber()

        return a.symbol.localeCompare(b.symbol)
      })
  }, [
    myTableData.data,
    spotPrices.data,
    assets.tokens,
    assets.stableswap,
    isAllAssets,
  ])

  return { data, isLoading: myTableData.isLoading }
}

export const getAssetsBalances = (
  accountBalances: Awaited<
    ReturnType<ReturnType<typeof getAccountBalances>>
  >["balances"],
  spotPrices: SpotPrice[],
  assetMetas: (TToken | TStableSwap)[],
  locksQueries: Array<Awaited<ReturnType<ReturnType<typeof getTokenLock>>>>,
  nativeData: Awaited<
    ReturnType<ReturnType<typeof getAccountBalances>>
  >["native"],
) => {
  const locks = locksQueries.reduce(
    (acc, cur) => (cur ? [...acc, ...cur] : acc),
    [] as { id: string; amount: BN; type: string }[],
  )

  const tokens: (AssetsTableDataBalances | null)[] = accountBalances.map(
    (ab) => {
      const id = ab.id
      const spotPrice = spotPrices.find((sp) => id.toString() === sp?.tokenIn)

      const meta = assetMetas.find((am) => id.toString() === am?.id)

      if (!spotPrice || !meta || !assetMetas) return null

      const dp = BN_10.pow(meta.decimals)
      const free = ab.data.free.toBigNumber()

      const reservedBN = ab.data.reserved.toBigNumber()
      const frozen = ab.data.frozen.toBigNumber()

      const total = free.plus(reservedBN).div(dp)
      const totalDisplay = total.times(spotPrice.spotPrice)

      const transferable = free.minus(frozen).div(dp)
      const transferableDisplay = transferable.times(spotPrice.spotPrice)

      const reserved = reservedBN.div(dp)
      const reservedDisplay = reserved.times(spotPrice.spotPrice)

      const lockMax = locks.reduce(
        (max, curr) =>
          curr.id === id.toString() && curr.amount.gt(max) ? curr.amount : max,
        BN_0,
      )

      const lockedMax = lockMax.div(dp)
      const lockedMaxDisplay = lockedMax.times(spotPrice.spotPrice)

      const lockVesting = locks.find(
        (lock) => lock.id === id.toString() && lock.type === "ormlvest",
      )
      const lockedVesting = lockVesting?.amount.div(dp) ?? BN_0
      const lockedVestingDisplay = lockedVesting.times(spotPrice.spotPrice)

      const lockDemocracy = locks.find(
        (lock) => lock.id === id.toString() && lock.type === "democrac",
      )
      const lockedDemocracy = lockDemocracy?.amount.div(dp) ?? BN_0
      const lockedDemocracyDisplay = lockedDemocracy.times(spotPrice.spotPrice)

      return {
        id,
        total,
        totalDisplay,
        transferable,
        transferableDisplay,
        lockedMax,
        lockedMaxDisplay,
        lockedVesting,
        lockedVestingDisplay,
        lockedDemocracy,
        lockedDemocracyDisplay,
        reserved,
        reservedDisplay,
      }
    },
  )

  const nativeBalance = nativeData.data

  const nativeDecimals = BN(
    assetMetas.find((am) => am?.id === NATIVE_ASSET_ID)?.decimals ?? 12,
  )

  const nativeSpotPrice = spotPrices.find(
    (sp) => sp.tokenIn === NATIVE_ASSET_ID,
  )?.spotPrice

  const nativeLockMax = locks.reduce(
    (max, curr) =>
      curr.id === NATIVE_ASSET_ID && curr.amount.gt(max) ? curr.amount : max,
    BN_0,
  )
  const nativeLockVesting = locks.find(
    (lock) => lock.id === NATIVE_ASSET_ID && lock.type === "ormlvest",
  )?.amount
  const nativeLockDemocracy = locks.find(
    (lock) => lock.id === NATIVE_ASSET_ID && lock.type === "democrac",
  )?.amount

  const native = getNativeBalances(
    nativeBalance,
    nativeDecimals,
    nativeSpotPrice,
    nativeLockMax,
    nativeLockVesting,
    nativeLockDemocracy,
  )

  return [native, ...tokens].filter(
    (x): x is AssetsTableDataBalances => x !== null,
  )
}

const getNativeBalances = (
  balance: PalletBalancesAccountData,
  decimals?: BN,
  spotPrice?: BN,
  lockMax?: BN,
  lockVesting?: BN,
  lockDemocracy?: BN,
): AssetsTableDataBalances | null => {
  if (!decimals || !spotPrice) return null

  const dp = BN_10.pow(decimals)
  const free = balance.free.toBigNumber()
  const reservedBN = balance.reserved.toBigNumber()
  const feeFrozen = balance.feeFrozen.toBigNumber()
  const miscFrozen = balance.miscFrozen.toBigNumber()

  const total = free.plus(reservedBN).div(dp)
  const totalDisplay = total.times(spotPrice)

  const transferable = free.minus(BN.max(feeFrozen, miscFrozen)).div(dp)
  const transferableDisplay = transferable.times(spotPrice)

  const reserved = reservedBN.div(dp)
  const reservedDisplay = reserved.times(spotPrice)

  const lockedMax = lockMax?.div(dp) ?? BN_0
  const lockedMaxDisplay = lockedMax.times(spotPrice)

  const lockedVesting = lockVesting?.div(dp) ?? BN_0
  const lockedVestingDisplay = lockedVesting.times(spotPrice)

  const lockedDemocracy = lockDemocracy?.div(dp) ?? BN_0
  const lockedDemocracyDisplay = lockedDemocracy.times(spotPrice)

  return {
    id: NATIVE_ASSET_ID,
    total,
    totalDisplay,
    transferable,
    transferableDisplay,
    lockedMax,
    lockedMaxDisplay,
    lockedVesting,
    lockedVestingDisplay,
    lockedDemocracy,
    lockedDemocracyDisplay,
    reserved,
    reservedDisplay,
  }
}

type AssetsTableDataBalances = {
  id: string | u32
  total: BN
  totalDisplay: BN
  transferable: BN
  transferableDisplay: BN
  lockedMax: BN
  lockedMaxDisplay: BN
  lockedVesting: BN
  lockedVestingDisplay: BN
  lockedDemocracy: BN
  lockedDemocracyDisplay: BN
  reserved: BN
  reservedDisplay: BN
}

export const useAssetsTradability = () => {
  const assets = useOmnipoolAssets()
  const hubTradability = useHubAssetTradability()
  const apiIds = useApiIds()

  const queries = [assets, hubTradability, apiIds]
  const isLoading = queries.some((q) => q.isLoading)
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!assets.data || !hubTradability.data || !apiIds.data) return undefined

    const results = assets.data.map((asset) => {
      const id = asset.id.toString()
      const bits = asset.data.tradable.bits.toNumber()
      const canBuy = is_buy_allowed(bits)
      const canSell = is_sell_allowed(bits)
      const canAddLiquidity = is_add_liquidity_allowed(bits)
      const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

      return { id, canBuy, canSell, canAddLiquidity, canRemoveLiquidity }
    })

    const hubBits = hubTradability.data.bits.toNumber()
    const canBuyHub = is_buy_allowed(hubBits)
    const canSellHub = is_sell_allowed(hubBits)
    const canAddLiquidityHub = is_add_liquidity_allowed(hubBits)
    const canRemoveLiquidityHub = is_remove_liquidity_allowed(hubBits)
    const hubResult = {
      id: apiIds.data.hubId,
      canBuy: canBuyHub,
      canSell: canSellHub,
      canAddLiquidity: canAddLiquidityHub,
      canRemoveLiquidity: canRemoveLiquidityHub,
    }

    return [...results, hubResult]
  }, [assets, hubTradability, apiIds])

  return { data, isLoading, isInitialLoading }
}
