import { useTokenLocks } from "api/balances"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_NAN, PARACHAIN_BLOCK_TIME } from "utils/constants"
import { arraySearch, sortAssets } from "utils/helpers"
import { useDisplayPrice, useNewDisplayPrices } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcceptedCurrencies, useAccountCurrency } from "api/payments"
import { useAccountVotes } from "api/democracy"
import { durationInDaysAndHoursFromNow } from "utils/formatting"
import { ToastMessage, useStore } from "state/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useExternalTokenMeta } from "sections/wallet/addToken/AddToken.utils"
import { useAssets } from "providers/assets"
import { useExternalTokensRugCheck } from "api/external"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { scaleHuman } from "utils/balance"

export const useAssetsData = ({
  isAllAssets,
  search,
  address: givenAddress,
}: {
  isAllAssets?: boolean
  search?: string
  address?: string
} = {}) => {
  const { account } = useAccount()
  const {
    tradable,
    stableswap,
    external,
    erc20,
    getAsset,
    tokens,
    getAssetWithFallback,
  } = useAssets()
  const address = givenAddress ?? account?.address

  const rugCheck = useExternalTokensRugCheck()

  const { data: balances, isLoading: isBalancesLoading } =
    useAccountAssets(address)
  const getExternalMeta = useExternalTokenMeta()

  const tokensWithBalance = useMemo(() => {
    if (balances) {
      const filteredTokens =
        balances.balances?.filter((balance) => {
          const meta = getAsset(balance.assetId)

          return (
            meta?.isToken ||
            meta?.isStableSwap ||
            meta?.isExternal ||
            meta?.isErc20
          )
        }) ?? []

      return filteredTokens
    }

    return []
  }, [balances, getAsset])

  const tokensWithBalanceIds = tokensWithBalance.map(
    (tokenWithBalance) => tokenWithBalance.assetId,
  )

  const { data: currencyId } = useAccountCurrency(address)
  const { data: acceptedCurrencies } =
    useAcceptedCurrencies(tokensWithBalanceIds)

  const spotPrices = useNewDisplayPrices(tokensWithBalanceIds)

  const allAssets = useMemo(
    () => [...tokens, ...stableswap, ...external, ...erc20],
    [external, stableswap, tokens, erc20],
  )

  const data = useMemo(() => {
    if (isBalancesLoading || !spotPrices.data) return []

    const rowsWithBalance = tokensWithBalance.map((balance) => {
      const asset = getAssetWithFallback(balance.assetId)
      const isExternalInvalid = asset.isExternal && !asset.symbol
      const meta = isExternalInvalid
        ? getExternalMeta(asset.id) ?? asset
        : asset

      const rugCheckData = asset.isExternal
        ? rugCheck.tokensMap.get(asset.id)
        : undefined

      const { decimals, id, name, symbol } = meta
      const inTradeRouter = tradable.some((tradeAsset) => tradeAsset.id === id)
      const spotPrice = spotPrices.data?.find(
        (spotPrice) => spotPrice?.tokenIn === id,
      )?.spotPrice

      const reserved = BigNumber(balance.reservedBalance).shiftedBy(-decimals)
      const reservedDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
          ? reserved.times(spotPrice).toString()
          : undefined

      const total = BigNumber(balance.total).shiftedBy(-decimals)
      const totalDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
          ? total.times(spotPrice).toString()
          : undefined

      const transferable = isExternalInvalid
        ? BN_NAN
        : BigNumber(balance.balance).shiftedBy(-decimals)
      const transferableDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
          ? transferable.times(spotPrice).toString()
          : undefined

      const isAcceptedCurrency = !!acceptedCurrencies?.find(
        (acceptedCurrencie) => acceptedCurrencie.id === id,
      )?.accepted

      const isPaymentFee = currencyId === id
      const couldBeSetAsPaymentFee = isAcceptedCurrency && !isPaymentFee

      const tradability = {
        canBuy: inTradeRouter,
        canSell: inTradeRouter,
        inTradeRouter,
      }

      return {
        id,
        symbol,
        name,
        meta,
        isPaymentFee,
        couldBeSetAsPaymentFee,
        reserved: reserved.toString(),
        reservedDisplay,
        total: total.toString(),
        totalDisplay,
        transferable: transferable.toString(),
        transferableDisplay,
        tradability,
        isExternalInvalid,
        rugCheckData,
      }
    })

    const rows = isAllAssets
      ? [
          ...rowsWithBalance,
          ...allAssets.reduce<typeof rowsWithBalance>((acc, meta) => {
            const { id, symbol, name, isExternal } = meta
            const isWithBalance = rowsWithBalance.some((row) => row.id === id)

            if (!isWithBalance) {
              const inTradeRouter = tradable.some(
                (tradeAsset) => tradeAsset.id === id,
              )

              const tradability = {
                canBuy: inTradeRouter,
                canSell: inTradeRouter,
                inTradeRouter,
              }

              const isExternalInvalid = isExternal && !symbol

              const asset = {
                id,
                symbol,
                name,
                meta,
                isPaymentFee: false,
                couldBeSetAsPaymentFee: false,
                reserved: "0",
                reservedDisplay: "0",
                total: "0",
                totalDisplay: "0",
                transferable: "0",
                transferableDisplay: "0",
                tradability,
                isExternalInvalid,
                rugCheckData: undefined,
              }

              acc.push(asset)
            }

            return acc
          }, []),
        ]
      : rowsWithBalance

    const sortedAssets = sortAssets(
      rows,
      "transferableDisplay",
      NATIVE_ASSET_ID,
    )

    return search
      ? arraySearch(sortedAssets, search, ["symbol", "name"])
      : sortedAssets
  }, [
    tokensWithBalance,
    spotPrices.data,
    isAllAssets,
    allAssets,
    search,
    getAssetWithFallback,
    getExternalMeta,
    tradable,
    acceptedCurrencies,
    currencyId,
    isBalancesLoading,
    rugCheck.tokensMap,
  ])

  return { data, isLoading: isBalancesLoading || spotPrices.isInitialLoading }
}

export type AssetsTableData = ReturnType<typeof useAssetsData>["data"][number]

export const useLockedNativeTokens = () => {
  const {
    native: { decimals, id },
  } = useAssets()
  const locks = useTokenLocks(id)
  const spotPrice = useDisplayPrice(id)

  const lockVesting = scaleHuman(
    locks.data?.find((lock) => lock.type === "ormlvest")?.amount ?? "0",
    decimals,
  )
  const lockDemocracy = scaleHuman(
    locks.data?.find((lock) => lock.type === "democrac")?.amount ?? "0",
    decimals,
  )

  const lockStaking = scaleHuman(
    locks.data?.find((lock) => lock.type === "stk_stks")?.amount ?? "0",
    decimals,
  )

  const lockVestingDisplay = lockVesting.times(spotPrice.data?.spotPrice ?? 1)
  const lockDemocracyDisplay = lockDemocracy.times(
    spotPrice.data?.spotPrice ?? 1,
  )
  const lockStakingDisplay = lockStaking.times(spotPrice.data?.spotPrice ?? 1)

  return {
    isLoading: locks.isLoading || spotPrice.isLoading,
    lockVesting,
    lockDemocracy,
    lockStaking,
    lockVestingDisplay,
    lockDemocracyDisplay,
    lockStakingDisplay,
  }
}

export const useUnlockableTokens = () => {
  const { native } = useAssets()
  const locks = useTokenLocks(native.id)
  const votes = useAccountVotes()
  const spotPrice = useDisplayPrice(native.id)

  const lockDemocracy = locks.data?.find(
    (lock) => lock.type === "democrac",
  )?.amount

  const value = !lockDemocracy
    ? BN_0
    : BigNumber(lockDemocracy)
        .minus(votes.data?.maxLockedValue ?? 0)
        .shiftedBy(-native.decimals)
  const lockedSeconds = votes.data?.maxLockedBlock.times(PARACHAIN_BLOCK_TIME)
  const endDate =
    votes.data && !votes.data.maxLockedBlock.isZero()
      ? durationInDaysAndHoursFromNow(
          lockedSeconds?.times(1000).toNumber() ?? 0,
        )
      : undefined

  return {
    isLoading: votes.isInitialLoading || spotPrice.isLoading || locks.isLoading,
    ids: votes.data?.ids ?? [],
    value,
    displayValue: value?.times(spotPrice.data?.spotPrice ?? 1),
    votesUnlocked: votes.data?.ids.length,
    endDate,
  }
}

export const useUnlockTokens = ({
  ids,
  toast,
}: {
  ids: string[]
  toast: ToastMessage
}) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { native } = useAssets()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(async () => {
    const txs = ids.map((id) => api.tx.democracy.removeVote(id))

    if (!account?.address) return null

    return await createTransaction(
      {
        tx: txs.length
          ? api.tx.utility.batchAll([
              ...txs,
              api.tx.democracy.unlock(account.address),
            ])
          : api.tx.democracy.unlock(account.address),
      },
      {
        toast,
        onSuccess: () => {
          queryClient.invalidateQueries(
            QUERY_KEYS.lock(account?.address, native.id),
          )
        },
      },
    )
  })
}
