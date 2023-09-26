import { useMutation } from "@tanstack/react-query"
import { DepositNftType } from "api/deposits"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"

export const useFarmExitAllMutation = (
  depositNfts: DepositNftType[],
  toast: ToastMessage,
  onClose?: () => void,
) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  return useMutation(async () => {
    const txs =
      depositNfts
        ?.map((record) => {
          return record.deposit.yieldFarmEntries.map((entry) => {
            return api.tx.omnipoolLiquidityMining.withdrawShares(
              record.id,
              entry.yieldFarmId,
            )
          })
        })
        .flat(2) ?? []

    if (txs.length > 1) {
      return await createTransaction(
        { tx: api.tx.utility.batchAll(txs) },
        { toast, onClose, onBack: () => {} },
      )
    } else {
      return await createTransaction(
        { tx: txs[0] },
        { toast, onClose, onBack: () => {} },
      )
    }
  })
}
