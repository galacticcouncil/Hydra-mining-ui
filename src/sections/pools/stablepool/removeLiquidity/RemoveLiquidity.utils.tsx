import {
  calculate_amplification,
  calculate_liquidity_out_one_asset,
} from "@galacticcouncil/math-stableswap"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { useTotalIssuances } from "api/totalIssuance"
import { useCallback, useMemo } from "react"

type Args = {
  poolId: string
  fee: string
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolLiquidityOut = ({ poolId, fee, reserves }: Args) => {
  const { data: pool } = useStableswapPool(poolId)
  const { data: bestNumber } = useBestNumber()
  const { data: issuances } = useTotalIssuances()

  const currentBlock = bestNumber?.relaychainBlockNumber.toString()
  const shareIssuance = issuances?.get(poolId)?.toString()

  const amplification = useMemo(() => {
    if (pool && currentBlock) {
      return calculate_amplification(
        pool.initialAmplification.toString(),
        pool.finalAmplification.toString(),
        pool.initialBlock.toString(),
        pool.finalBlock.toString(),
        currentBlock,
      )
    }
  }, [pool, currentBlock])

  const getAssetOutValue = useCallback(
    (assetId: number, shares: string) => {
      if (amplification && shareIssuance) {
        return calculate_liquidity_out_one_asset(
          JSON.stringify(reserves),
          shares,
          assetId,
          amplification,
          shareIssuance,
          fee,
        )
      }

      return "0"
    },
    [amplification, fee, reserves, shareIssuance],
  )

  return {
    getAssetOutValue,
  }
}
