import { useMutation } from "@tanstack/react-query"
import { useExternalApi } from "api/external"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { CEX_CONFIG } from "sections/deposit/DepositPage.utils"
import { useStore } from "state/store"
import BN from "bignumber.js"

type WithdrawalTransferValues = {
  cexAddress: string
  amount: string
}

export const useWithdrawalToCex = (cexId: string, assetId: string) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()

  const { getAsset } = useAssets()

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)
  const asset = cex ? cex.assets.find((a) => a.assetId === assetId) : null
  const assetDetails = getAsset(assetId)

  const chain = asset?.route[0] ?? ""

  const { data: api } = useExternalApi(chain)
  return useMutation(async (values: WithdrawalTransferValues) => {
    if (!api) throw new Error(`${chain} API is not connected`)
    if (!cex) throw new Error(`CEX ${cexId} not found`)
    if (!assetDetails) throw new Error(`Asset ${assetId} not found`)

    if (chain === "polkadot") {
      const amount = BN(values.amount).shiftedBy(assetDetails.decimals)

      const tx = api.tx.balances.transferKeepAlive(
        values.cexAddress,
        amount.toString(),
      )

      const paymentInfo = await tx.paymentInfo(values.cexAddress)
      const paymentFee = BN(paymentInfo.partialFee.toString())
        .multipliedBy(0.1)
        .decimalPlaces(0)

      const adjustedAmmount = amount.minus(paymentFee)

      return createTransaction({
        title: t("withdraw.transfer.cex.modal.title", { cex: cex.title }),
        tx: api.tx.balances.transferKeepAlive(
          values.cexAddress,
          adjustedAmmount.toString(),
        ),
      })
    }

    throw new Error(`Unsupported chain ${chain}`)
  })
}
