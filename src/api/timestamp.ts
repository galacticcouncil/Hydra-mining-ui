import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"

export function useTimestamp(
  blockNumber?: Maybe<u32 | BigNumber>,
  enabled = true,
) {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.timestamp(blockNumber),
    () =>
      blockNumber !== null ? getTimestamp(api, blockNumber) : undefinedNoop(),
    {
      enabled: !!blockNumber && enabled,
    },
  )
}

export async function getTimestamp(
  api: ApiPromise,
  blockNumber?: u32 | BigNumber,
) {
  if (blockNumber != null) {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber.toString())
    const apiAt = await api.at(blockHash)
    const now = await apiAt.query.timestamp.now()
    return now.toNumber()
  }

  const now = await api.query.timestamp.now()
  return now.toNumber()
}
