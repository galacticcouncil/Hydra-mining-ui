import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { undefinedNoop } from "utils/helpers"
import { PoolBase } from "@galacticcouncil/sdk"

export const useStableswapPool = (poolId?: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.stableswapPool(poolId),
    poolId ? getStableswapPool(api, poolId) : undefinedNoop,
    { enabled: !!poolId },
  )
}

export const getStableswapPool =
  (api: ApiPromise, poolId: string) => async () => {
    const res = await api.query.stableswap.pools(poolId)
    return res.unwrap()
  }

export const useStableSDKPools = () => {
  return useQuery<PoolBase[]>(QUERY_KEYS.stablePools, {
    enabled: false,
    staleTime: Infinity,
  })
}
