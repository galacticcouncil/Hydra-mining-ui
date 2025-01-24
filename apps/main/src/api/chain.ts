import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const bestNumberQuery = (context: TProviderContext) => {
  const { isApiLoaded, api, rpcUrlList } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "bestNumber", rpcUrlList.join(",")],
    queryFn: async () => {
      const [validationData, parachainBlockNumber, timestamp] =
        await Promise.all([
          api.query.parachainSystem.validationData(),
          api.derive.chain.bestNumber(),
          api.query.timestamp.now(),
        ])

      const relaychainBlockNumber = validationData.unwrap().relayParentNumber
      return {
        parachainBlockNumber: parachainBlockNumber.toNumber(),
        relaychainBlockNumber: relaychainBlockNumber.toNumber(),
        timestamp: timestamp.toNumber(),
      }
    },
  })
}
