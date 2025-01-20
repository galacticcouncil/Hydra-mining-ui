import { ApiPromise } from "@polkadot/api"
import { u128, Option, StorageKey, Null } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import {
  PalletLiquidityMiningDepositData,
  PalletOmnipoolPosition,
} from "@polkadot/types/lookup"
import { undefinedNoop } from "utils/helpers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { parseBalanceData, TBalance } from "./balances"
import { TAsset, TBond, TShareToken, useAssets } from "providers/assets"
import { millisecondsInHour } from "date-fns/constants"
import { getAccountBalanceData } from "api/accountBalances"

export type TYieldFarmEntry = {
  globalFarmId: string
  yieldFarmId: string
  enteredAt: string
  updatedAt: string
  accumulatedRpvs: string
  valuedShares: string
  accumulatedClaimedRewards: string
  stoppedAtCreation: string
}

type TDepositData = {
  shares: string
  ammPoolId: string
  yieldFarmEntries: Array<TYieldFarmEntry>
}

export type TDeposit = {
  id: string
  data: TDepositData
  isXyk: boolean
}

export type TOmnipoolPosition = {
  id: string
  assetId: string
  amount: string
  shares: string
  price: string[]
}

export type TAccountAsset = {
  balance?: TBalance
  asset: TAsset
  isPoolPositions: boolean
  xykDeposits?: TDeposit[]
  omnipoolDeposits?: TDeposit[]
  liquidityPositions?: TOmnipoolPosition[]
  depositLiquidityPositions?: (TOmnipoolPosition & {
    depositId: string
  })[]
}

export const useRefetchAccountAssets = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return () => {
    queryClient.refetchQueries(QUERY_KEYS.accountAssets(account?.address))
  }
}

const parseNfts = (
  nfts: [StorageKey<[AccountId32, u128, u128]>, Option<Null>][],
) =>
  nfts.map(([storageKey]) => {
    const [owner, classId, instanceId] = storageKey.args

    return {
      owner: owner.toString(),
      classId: classId.toString(),
      instanceId: instanceId.toString(),
    }
  })

const parceLiquidityPositions = <T>(
  positions: Option<PalletOmnipoolPosition>[],
  ids: string[],
  metadata?: T[],
) =>
  positions.reduce<
    Array<
      {
        id: string
        assetId: string
        amount: string
        shares: string
        price: string[]
      } & T
    >
  >((acc, pos, i) => {
    if (!pos.isNone) {
      const data = pos.unwrap()

      acc.push({
        id: ids[i],
        amount: data.amount.toString(),
        shares: data.shares.toString(),
        price: data.price.map((e) => e.toString()),
        assetId: data.assetId.toString(),
        ...(metadata ? metadata[i] : ({} as T)),
      })
    }

    return acc
  }, [])

const parseDepositData = (
  api: ApiPromise,
  nfts: {
    owner: string
    classId: string
    instanceId: string
  }[],
  values: Option<PalletLiquidityMiningDepositData>[],
  isXyk: boolean,
) => {
  return nfts
    .reduce<
      {
        id: string
        data: TDepositData
        isXyk: boolean
      }[]
    >((acc, nft, index) => {
      const dataRaw = values[index]

      if (!dataRaw.isNone) {
        const dataUnwraped = api.registry.createType(
          isXyk ? "XykLMDeposit" : "OmnipoolLMDeposit",
          dataRaw.unwrap(),
        ) as PalletLiquidityMiningDepositData
        const data: TDepositData = {
          ammPoolId: dataUnwraped.ammPoolId.toString(),
          shares: dataUnwraped.shares.toString(),
          yieldFarmEntries: dataUnwraped.yieldFarmEntries.map((farmEntry) => ({
            globalFarmId: farmEntry.globalFarmId.toString(),
            yieldFarmId: farmEntry.yieldFarmId.toString(),
            enteredAt: farmEntry.enteredAt.toString(),
            updatedAt: farmEntry.updatedAt.toString(),
            valuedShares: farmEntry.valuedShares.toString(),
            accumulatedRpvs: farmEntry.accumulatedRpvs.toString(),
            accumulatedClaimedRewards:
              farmEntry.accumulatedClaimedRewards.toString(),
            stoppedAtCreation: farmEntry.stoppedAtCreation.toString(),
          })),
        }
        acc.push({
          id: nft.instanceId,
          data,
          isXyk,
        })
      }

      return acc
    }, [])
    .sort((a, b) => {
      const firstFarmLastBlock = a.data.yieldFarmEntries.reduce(
        (acc, curr) => (acc.lt(curr.enteredAt) ? BN(curr.enteredAt) : acc),
        BN_0,
      )

      const secondFarmLastBlock = b.data.yieldFarmEntries.reduce(
        (acc, curr) => (acc.lt(curr.enteredAt) ? BN(curr.enteredAt) : acc),
        BN_0,
      )

      return secondFarmLastBlock.minus(firstFarmLastBlock).toNumber()
    })
}

export const useAccountAssets = (givenAddress?: string) => {
  const { account } = useAccount()
  const { api, isLoaded } = useRpcProvider()
  const { getAssetWithFallback, getShareTokenByAddress, isShareToken, isBond } =
    useAssets()

  const address = givenAddress ?? account?.address

  return useQuery(
    QUERY_KEYS.accountAssets(address),
    address != null
      ? async () => {
          const [omnipoolNftId, miningNftId, xykMiningNftId, accountBalances] =
            await Promise.all([
              api.consts.omnipool.nftCollectionId,
              api.consts.omnipoolLiquidityMining.nftCollectionId,
              api.consts.xykLiquidityMining.nftCollectionId,
              getAccountBalanceData(api, address),
            ])
          const [omnipoolNftsRaw, miningNftsRaw, xykMiningNftsRaw] =
            await Promise.all([
              api.query.uniques.account.entries(address, omnipoolNftId),
              api.query.uniques.account.entries(address, miningNftId),
              api.query.uniques.account.entries(address, xykMiningNftId),
            ])

          const omnipoolNfts = parseNfts(omnipoolNftsRaw)
          const miningNfts = parseNfts(miningNftsRaw)
          const xykMiningNfts = parseNfts(xykMiningNftsRaw)

          const liquidityPositionIds = omnipoolNfts.map((nft) => nft.instanceId)
          const omnipoolKeys = miningNfts.map((nft) =>
            api.query.omnipoolWarehouseLM.deposit.key(nft.instanceId),
          )
          const xykKeys = xykMiningNfts.map((nft) =>
            api.query.xykWarehouseLM.deposit.key(nft.instanceId),
          )

          const [
            liquidityPos,
            omniPositionIdsRaw,
            omnipoolData = [],
            xykData = [],
          ] = await Promise.all([
            api.query.omnipool.positions.multi(liquidityPositionIds),
            api.query.omnipoolLiquidityMining.omniPositionId.multi(
              miningNfts.map((nft) => nft.instanceId),
            ),
            omnipoolKeys.length
              ? (api.rpc.state.queryStorageAt(omnipoolKeys) as Promise<
                  Option<PalletLiquidityMiningDepositData>[]
                >)
              : [],
            xykKeys.length
              ? (api.rpc.state.queryStorageAt(xykKeys) as Promise<
                  Option<PalletLiquidityMiningDepositData>[]
                >)
              : undefined,
          ])

          const omniPositionIds = omniPositionIdsRaw.map((id) => id.toString())

          const depositLiquidityPositions = parceLiquidityPositions(
            await api.query.omnipool.positions.multi(omniPositionIds),
            omniPositionIds,
            miningNfts.map((nft) => ({ depositId: nft.instanceId })),
          )

          const liquidityPositions = parceLiquidityPositions(
            liquidityPos,
            liquidityPositionIds,
          )

          const omnipoolDeposits = parseDepositData(
            api,
            miningNfts,
            omnipoolData,
            false,
          )

          const xykDeposits = parseDepositData(
            api,
            xykMiningNfts,
            xykData,
            true,
          )

          const allBalances = accountBalances.map(([id, data]) => {
            return parseBalanceData(data, id.toString(), address)
          })

          return {
            omnipoolNfts,
            miningNfts,
            xykMiningNfts,
            liquidityPositions,
            depositLiquidityPositions,
            omnipoolDeposits,
            xykDeposits,
            balances: allBalances,
            accountAddress: address,
          }
        }
      : undefinedNoop,
    {
      enabled: !!address && isLoaded,
      staleTime: millisecondsInHour,
      select: (data) => {
        const {
          balances = [],
          xykDeposits = [],
          omnipoolDeposits = [],
          liquidityPositions = [],
          depositLiquidityPositions = [],
        } = data ?? {}

        let isAnyPoolPositions = false
        const accountShareTokensMap: Map<
          string,
          { balance: TBalance; asset: TShareToken }
        > = new Map([])

        const accountStableswapMap: Map<
          string,
          { balance: TBalance; asset: TAsset }
        > = new Map([])

        const accountBondsMap: Map<
          string,
          { balance: TBalance; asset: TBond }
        > = new Map([])

        const accountAssetsMap = balances.reduce<Map<string, TAccountAsset>>(
          (acc, balance) => {
            if (BN(balance.total).gt(0)) {
              const asset = getAssetWithFallback(balance.assetId)
              const isPoolPositions =
                (asset.isShareToken || asset.isStableSwap) &&
                BN(balance.balance).gt(0)

              if (isPoolPositions) isAnyPoolPositions = true

              acc.set(balance.assetId, { balance, asset, isPoolPositions })

              if (isShareToken(asset))
                accountShareTokensMap.set(balance.assetId, {
                  balance,
                  asset,
                })

              if (asset.isStableSwap)
                accountStableswapMap.set(balance.assetId, {
                  balance,
                  asset,
                })

              if (isBond(asset))
                accountBondsMap.set(balance.assetId, {
                  balance,
                  asset,
                })
            }

            return acc
          },
          new Map([]),
        )

        xykDeposits.forEach((deposit) => {
          const asset = getShareTokenByAddress(
            deposit.data.ammPoolId.toString(),
          )

          if (asset) {
            const balance = accountAssetsMap.get(asset.id)
            isAnyPoolPositions = true

            accountAssetsMap.set(asset.id, {
              ...(balance ?? {}),
              asset,
              xykDeposits: [...(balance?.xykDeposits ?? []), deposit],
              isPoolPositions: true,
            })
          }
        })

        omnipoolDeposits.forEach((omnipoolDeposit) => {
          const asset = getAssetWithFallback(
            omnipoolDeposit.data.ammPoolId.toString(),
          )

          if (asset) {
            const balance = accountAssetsMap.get(asset.id)
            isAnyPoolPositions = true

            accountAssetsMap.set(asset.id, {
              ...(balance ?? {}),
              asset,
              omnipoolDeposits: [
                ...(balance?.omnipoolDeposits ?? []),
                omnipoolDeposit,
              ],
              isPoolPositions: true,
            })
          }
        })

        liquidityPositions.forEach((liquidityPosition) => {
          const asset = getAssetWithFallback(liquidityPosition.assetId)

          if (asset) {
            const balance = accountAssetsMap.get(asset.id)
            isAnyPoolPositions = true

            accountAssetsMap.set(asset.id, {
              ...(balance ?? {}),
              asset,
              liquidityPositions: [
                ...(balance?.liquidityPositions ?? []),
                liquidityPosition,
              ],
              isPoolPositions: true,
            })
          }
        })

        depositLiquidityPositions.forEach((depositLiquidityPosition) => {
          const asset = getAssetWithFallback(depositLiquidityPosition.assetId)

          if (asset) {
            const balance = accountAssetsMap.get(asset.id)
            isAnyPoolPositions = true

            accountAssetsMap.set(asset.id, {
              ...(balance ?? {}),
              asset,
              depositLiquidityPositions: [
                ...(balance?.depositLiquidityPositions ?? []),
                depositLiquidityPosition,
              ],
              isPoolPositions: true,
            })
          }
        })

        return {
          ...data,
          accountAssetsMap,
          accountShareTokensMap,
          accountStableswapMap,
          accountBondsMap,
          isAnyPoolPositions,
        }
      },
    },
  )
}
