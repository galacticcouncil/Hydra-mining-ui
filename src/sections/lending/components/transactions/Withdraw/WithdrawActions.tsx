import { ProtocolAction } from "@aave/contract-helpers"
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"

export interface WithdrawActionsProps {
  poolReserve: ComputedReserveData
  amountToWithdraw: string
  poolAddress: string
  isWrongNetwork: boolean
  symbol: string
  blocked: boolean
  className?: string
}

export const WithdrawActions = ({
  poolReserve,
  amountToWithdraw,
  poolAddress,
  isWrongNetwork,
  symbol,
  blocked,
  className,
}: WithdrawActionsProps) => {
  const withdraw = useRootStore((state) => state.withdraw)

  const {
    action,
    loadingTxns,
    mainTxState,
    approvalTxState,
    approval,
    requiresApproval,
  } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () =>
      withdraw({
        reserve: poolAddress,
        amount: amountToWithdraw,
        aTokenAddress: poolReserve.aTokenAddress,
      }),
    skip: !amountToWithdraw || parseFloat(amountToWithdraw) === 0 || blocked,
    deps: [amountToWithdraw, poolAddress],
    eventTxInfo: {
      amount: amountToWithdraw,
      assetName: poolReserve.name,
      asset: poolReserve.underlyingAsset,
    },
    protocolAction: ProtocolAction.withdraw,
  })

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      amount={amountToWithdraw}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      actionInProgressText={<span>Withdrawing {symbol}</span>}
      actionText={<span>Withdraw {symbol}</span>}
      handleAction={action}
      handleApproval={() =>
        approval([{ amount: amountToWithdraw, underlyingAsset: poolAddress }])
      }
      requiresApproval={requiresApproval}
      className={className}
    />
  )
}
