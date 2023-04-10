import { u32 } from "@polkadot/types"
import { useMutation } from "@tanstack/react-query"
import { useFarms } from "api/farms"
import { StepProps } from "components/Stepper/Stepper"
import { ToastMessage, useStore } from "state/store"
import { useApiPromise } from "utils/api"

export type FarmDepositMutationType = ReturnType<typeof useFarmDepositMutation>

export const useFarmDepositMutation = (
  poolId: u32,
  positionId: string,
  toast: ToastMessage,
  onClose: () => void,
) => {
  const { createTransaction } = useStore()
  const api = useApiPromise()
  const farms = useFarms([poolId])

  return useMutation(async () => {
    const [firstFarm, ...restFarm] = farms.data ?? []
    if (firstFarm == null) throw new Error("Missing farm")

    //TODO: use enums intead of state string
    const firstStep: StepProps[] = [
      {
        label: "Join Farm 1",
        state: "active",
      },
      {
        label: "Join Farm 2",
        state: "todo",
      },
    ]

    const firstDeposit = await createTransaction(
      {
        tx: api.tx.omnipoolLiquidityMining.depositShares(
          firstFarm.globalFarm.id,
          firstFarm.yieldFarm.id,
          positionId,
        ),
      },
      {
        toast,
        steps: firstStep,
        onSubmitted: onClose,
        onClose,
        withBack: true,
      },
    )

    for (const record of firstDeposit.events) {
      if (api.events.omnipoolLiquidityMining.SharesDeposited.is(record.event)) {
        const depositId = record.event.data.depositId

        const secondStep: StepProps[] = [
          {
            label: "Join Farm 1",
            state: "done",
          },
          {
            label: "Join Farm 2",
            state: "active",
          },
        ]

        const txs = restFarm.map((farm) =>
          api.tx.omnipoolLiquidityMining.redepositShares(
            farm.globalFarm.id,
            farm.yieldFarm.id,
            depositId,
          ),
        )

        if (txs.length > 0) {
          await createTransaction(
            {
              tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0],
            },
            { toast, steps: secondStep },
          )
        }
      }
    }
  })
}
