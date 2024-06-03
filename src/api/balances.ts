import { NATIVE_ASSET_ID } from "utils/api"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccountCurrency } from "./payments"
import { useSpotPrice } from "./spotPrice"
import { usePaymentInfo } from "./transaction"
import { BN_0, BN_1 } from "utils/constants"
import BN from "bignumber.js"

const EDFactor = 0.5 //50%

export function calculateFreeBalance(free: BigNumber, frozen: BigNumber) {
  return free.minus(frozen)
}

export const getTokenBalance =
  (api: ApiPromise, account: AccountId32 | string, id: string | u32) =>
  async () => {
    if (id.toString() === NATIVE_ASSET_ID) {
      const res = await api.query.system.account(account)
      const freeBalance = new BigNumber(res.data.free.toHex())
      const feeFrozenBalance = new BigNumber(
        //@ts-ignore
        res.data.feeFrozen?.toHex() ?? res.data.frozen.toHex(),
      )
      const miscFrozenBalance = new BigNumber(res.data.miscFrozen?.toHex() ?? 0)
      const reservedBalance = new BigNumber(res.data.reserved.toHex())

      const balance = new BigNumber(
        calculateFreeBalance(
          freeBalance,
          BigNumber.max(feeFrozenBalance, miscFrozenBalance),
        ) ?? NaN,
      )

      return {
        accountId: account,
        assetId: id,
        balance,
        total: freeBalance.plus(reservedBalance),
        freeBalance,
      }
    }

    const res = await api.query.tokens.accounts(account, id)

    const freeBalance = new BigNumber(res.free.toHex())
    const reservedBalance = new BigNumber(res.reserved.toHex())
    const frozenBalance = new BigNumber(res.frozen.toHex())
    const balance = new BigNumber(
      calculateFreeBalance(freeBalance, frozenBalance) ?? NaN,
    )

    return {
      accountId: account,
      assetId: id,
      balance,
      total: freeBalance.plus(reservedBalance),
      freeBalance,
    }
  }

export const useTokenBalance = (
  id: Maybe<string | u32>,
  address: Maybe<AccountId32 | string>,
) => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.tokenBalance(id, address),
    address != null && id != null
      ? getTokenBalance(api, address, id)
      : undefinedNoop,
    { enabled: address != null && id != null },
  )
}

export function useTokensBalances(
  tokenIds: (string | u32)[],
  address: Maybe<AccountId32 | string>,
  noRefresh?: boolean,
) {
  const { api } = useRpcProvider()

  return useQueries({
    queries: tokenIds.map((id) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.tokenBalance(id, address)
        : QUERY_KEYS.tokenBalanceLive(id, address),
      queryFn:
        address != null ? getTokenBalance(api, address, id) : undefinedNoop,
      enabled: !!id && !!address,
    })),
  })
}

const getExistentialDeposit = (api: ApiPromise) => {
  return api.consts.balances.existentialDeposit
}

export function useExistentialDeposit() {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.existentialDeposit, async () => {
    const existentialDeposit = await getExistentialDeposit(api)
    return existentialDeposit.toBigNumber()
  })
}

export const useTokensLocks = (ids: Maybe<u32 | string>[]) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()

  const normalizedIds = ids?.reduce<string[]>((memo, item) => {
    if (item != null) memo.push(item.toString())
    return memo
  }, [])

  return useQueries({
    queries: normalizedIds?.map((id) => ({
      queryKey: QUERY_KEYS.lock(account?.address, id),
      queryFn:
        account?.address != null
          ? getTokenLock(api, account.address, id)
          : undefinedNoop,
      enabled: !!account?.address,
    })),
  })
}

export const useTokenLocks = (id: Maybe<u32 | string>) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    QUERY_KEYS.lock(account?.address, id),
    account?.address != null
      ? getTokenLock(api, account.address, id?.toString() ?? "")
      : undefinedNoop,
    { enabled: !!account?.address && !!id },
  )
}

export const getTokenLock =
  (api: ApiPromise, address: AccountId32 | string, id: string) => async () => {
    if (id === NATIVE_ASSET_ID) {
      const res = await api.query.balances.locks(address)
      return res.map((lock) => ({
        id: id,
        amount: lock.amount.toBigNumber(),
        type: lock.id.toHuman(),
      }))
    }

    const res = await api.query.tokens.locks(address, id)
    return res.map((lock) => ({
      id: id,
      amount: lock.amount.toBigNumber(),
      type: lock.id.toString(),
    }))
  }

/**
 * Used for calculations max transfarable values
 * @param   assetId  asset that max balance should be calculated for
 * @param   extrinsic  based on which fee will be calculated. Should be passed with max value
 */
export const useMaxBalance = (
  assetId: string,
  extrinsic: SubmittableExtrinsic,
  ignoreED?: boolean,
) => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()

  const accountCurrency = useAccountCurrency(account?.address)
  const paymentInfo = usePaymentInfo(extrinsic)
  const balanceQuery = useTokenBalance(assetId, account?.address)

  const balance = balanceQuery.data?.balance ?? BN_0

  const assetMeta = assets.getAsset(assetId)

  const currencyMeta = accountCurrency.data
    ? assets.getAsset(accountCurrency.data)
    : undefined

  const isPaymentAsset = accountCurrency.data === assetId

  const spotPriceQuery = useSpotPrice(assets.native.id, currencyMeta?.id)

  let spotPrice = spotPriceQuery.data?.spotPrice ?? BN_1

  const nativeFee = paymentInfo.data?.partialFee.toBigNumber()

  const fee = nativeFee
    ? currencyMeta?.id === assets.native.id
      ? nativeFee
      : nativeFee
          .shiftedBy(-assets.native.decimals)
          .times(spotPrice)
          .shiftedBy(currencyMeta?.decimals ?? 0)
    : undefined

  const existentialDeposit = assetMeta.existentialDeposit.times(EDFactor)

  const maxBalance = isPaymentAsset
    ? balance.minus(fee ?? 0).minus(ignoreED ? 0 : existentialDeposit)
    : balance

  return {
    isLoading:
      accountCurrency.isInitialLoading ||
      paymentInfo.isInitialLoading ||
      balanceQuery.isInitialLoading,
    balance: balance,
    maxBalance: BN.max(BN_0, maxBalance.toFixed(0)),
    fee,
  }
}

export const useShareTokenBalances = (shareTokenIds: string[]) => {
  const { api, assets } = useRpcProvider()

  const shareTokens = assets
    .getAssets(shareTokenIds)
    .reduce<{ id: string; address: string }[]>((acc, asset) => {
      if (assets.isShareToken(asset)) {
        asset.assets.forEach((id) =>
          acc.push({ id, address: asset.poolAddress }),
        )
      }

      return acc
    }, [])

  return useQueries({
    queries: shareTokens.map(({ id, address }) => ({
      queryKey: QUERY_KEYS.tokenBalanceLive(id, address),
      queryFn:
        address != null ? getTokenBalance(api, address, id) : undefinedNoop,
      enabled: !!id && !!address,
    })),
  })
}
