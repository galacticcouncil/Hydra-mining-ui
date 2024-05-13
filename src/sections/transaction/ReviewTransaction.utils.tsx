import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers"
import { Hash } from "@open-web3/orml-types/interfaces"
import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import type { AnyJson } from "@polkadot/types-codec/types"
import { ExtrinsicStatus } from "@polkadot/types/interfaces"
import { ISubmittableResult } from "@polkadot/types/types"
import { MutationObserverOptions, useMutation } from "@tanstack/react-query"
import { decodeError } from "ethers-decode-error"
import { useRpcProvider } from "providers/rpcProvider"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMountedState } from "react-use"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { PermitResult } from "sections/web3-connect/signer/EthereumSigner"
import { useToast } from "state/toasts"
import { H160, getEvmChainById, getEvmTxLink, isEvmAccount } from "utils/evm"
import { defer } from "utils/helpers"
import { getSubscanLinkByType } from "utils/formatting"

type TxMethod = AnyJson & {
  method: string
  section: string
  args: { [key: string]: AnyJson }
}

function isTxMethod(x: AnyJson): x is TxMethod {
  return typeof x === "object" && x != null && "method" in x && "section" in x
}

type TxHuman = Record<string, { args: TxMethod["args"] }>

function getTxHuman(x: AnyJson, prefix = ""): TxHuman | null {
  if (!isTxMethod(x)) return null

  const key = `${prefix}${x.section}.${x.method}(args)`
  let args = x.args

  if (
    (key === "utility.batch(args)" || key === "utility.batchAll(args)") &&
    Array.isArray(x.args.calls)
  ) {
    args = {
      calls: x.args.calls.reduce<TxHuman>((memo, item, idx) => {
        const parsed = getTxHuman(item, `#${idx}: `)
        if (parsed == null) return memo
        return { ...memo, ...parsed }
      }, {}),
    }
  }

  return { [key]: { args } }
}

type TxExtrinsic = AnyJson & { method: TxMethod }

function isTxExtrinsic(x: AnyJson): x is TxExtrinsic {
  return (
    typeof x === "object" && x != null && "method" in x && isTxMethod(x.method)
  )
}

export function isSetCurrencyExtrinsic(tx?: AnyJson) {
  return isTxExtrinsic(tx) && tx.method.method === "setCurrency"
}

export function getTransactionJSON(tx: SubmittableExtrinsic<"promise">) {
  const txEx = tx.toHuman()
  const res = isTxExtrinsic(txEx) ? getTxHuman(txEx.method) : null
  if (res == null || Object.entries(res).length !== 1) return null

  const [method, { args: argsRaw }] = Object.entries(res)[0]

  const args = Object.fromEntries(
    Object.entries(argsRaw).map(([key, value]) => [
      key,
      // format EVM account address to EVM H160
      typeof value === "string" && isEvmAccount(value)
        ? H160.fromAccount(value)
        : value,
    ]),
  )
  return { method, args }
}

export class UnknownTransactionState extends Error {}

export class TransactionError extends Error {
  docs: string = ""
  method: string = ""
  constructor(public error: string) {
    super(error)
  }
}

function evmTxReceiptToSubmittableResult(txReceipt: TransactionReceipt) {
  const isSuccess = txReceipt.status === 1
  const submittableResult: ISubmittableResult = {
    status: {} as ExtrinsicStatus,
    events: [],
    isCompleted: isSuccess,
    isError: !isSuccess,
    isFinalized: isSuccess,
    isInBlock: isSuccess,
    isWarning: false,
    txHash: txReceipt.transactionHash as unknown as Hash,
    txIndex: txReceipt.transactionIndex,
    filterRecords: () => [],
    findRecord: () => undefined,
    toHuman: () => ({}),
  }

  return submittableResult
}

const createResultOnCompleteHandler =
  (
    api: ApiPromise,
    {
      onSuccess,
      onError,
      onSettled,
    }: {
      onSuccess: (result: ISubmittableResult) => void
      onError: (error: Error) => void
      onSettled: () => void
    },
  ) =>
  (result: ISubmittableResult) => {
    if (result.isCompleted) {
      if (result.dispatchError) {
        let docs = ""
        let method = ""
        let errorMessage = result.dispatchError.toString()

        if (result.dispatchError.isModule) {
          const decoded = api.registry.findMetaError(
            result.dispatchError.asModule,
          )
          docs = decoded.docs.join(" ")
          method = decoded.method
          errorMessage = `${decoded.section}.${decoded.method}: ${docs}`
        }

        const error = new TransactionError(errorMessage)
        error.docs = docs
        error.method = method

        onError(error)
      } else {
        onSuccess(result)
      }

      onSettled()
    }
  }

export const useSendEvmTransactionMutation = (
  options: MutationObserverOptions<
    ISubmittableResult & {
      transactionLink?: string
    },
    TransactionError,
    {
      evmTx: TransactionResponse
      tx?: SubmittableExtrinsic<"promise">
    }
  > = {},
) => {
  const [txState, setTxState] = useState<ExtrinsicStatus["type"] | null>(null)
  const [txHash, setTxHash] = useState<string>("")

  const { account } = useEvmAccount()

  const sendTx = useMutation(async ({ evmTx }) => {
    return await new Promise(async (resolve, reject) => {
      const timeout = setTimeout(
        () => {
          clearTimeout(timeout)
          reject(new UnknownTransactionState())
        },
        5 * 60 * 1000,
      )

      try {
        setTxState("Broadcast")
        setTxHash(evmTx?.hash ?? "")
        const receipt = await evmTx.wait()
        setTxState("InBlock")

        return resolve(evmTxReceiptToSubmittableResult(receipt))
      } catch (err) {
        const { error } = decodeError(err)
        reject(new TransactionError(error))
      } finally {
        clearTimeout(timeout)
      }
    })
  }, options)

  const chain = account?.chainId ? getEvmChainById(account.chainId) : null
  const txLink = txHash && chain ? getEvmTxLink(txHash, chain.key) : ""

  return {
    ...sendTx,
    txState,
    txLink,
    reset: () => {
      setTxState(null)
      setTxHash("")
      sendTx.reset()
    },
  }
}

export const useSendDispatchPermit = (
  options: MutationObserverOptions<
    ISubmittableResult,
    unknown,
    PermitResult
  > = {},
) => {
  const { api } = useRpcProvider()
  const [txState, setTxState] = useState<ExtrinsicStatus["type"] | null>(null)
  const [txHash, setTxHash] = useState<string>("")
  const isMounted = useMountedState()

  const sendTx = useMutation(async (permit) => {
    return await new Promise(async (resolve, reject) => {
      try {
        const unsubscribe = await api.tx.multiTransactionPayment
          .dispatchPermit(
            permit.message.from,
            permit.message.to,
            permit.message.value,
            permit.message.data,
            permit.message.gaslimit,
            permit.message.deadline,
            permit.signature.v,
            permit.signature.r,
            permit.signature.s,
          )
          .send(async (result) => {
            if (!result || !result.status) return

            const timeout = setTimeout(() => {
              clearTimeout(timeout)
              reject(new UnknownTransactionState())
            }, 60000)

            if (isMounted()) {
              setTxHash(result.txHash.toHex())
              setTxState(result.status.type)
            } else {
              clearTimeout(timeout)
            }

            const onComplete = createResultOnCompleteHandler(api, {
              onError: (error) => {
                clearTimeout(timeout)
                reject(error)
              },
              onSuccess: (result) => {
                clearTimeout(timeout)
                resolve(result)
              },
              onSettled: unsubscribe,
            })

            return onComplete(result)
          })
      } catch (err) {
        reject(err?.toString() ?? "Unknown error")
      }
    })
  }, options)

  const txLink = txHash
    ? `${getSubscanLinkByType("extrinsic")}/${txHash}`
    : undefined

  return {
    ...sendTx,
    txState,
    txLink,
    reset: () => {
      setTxState(null)
      setTxHash("")
      sendTx.reset()
    },
  }
}

export const useSendTransactionMutation = (
  options: MutationObserverOptions<
    ISubmittableResult & { transactionLink?: string },
    TransactionError,
    SubmittableExtrinsic<"promise">
  > = {},
) => {
  const { api } = useRpcProvider()
  const isMounted = useMountedState()
  const [txState, setTxState] = useState<ExtrinsicStatus["type"] | null>(null)
  const [txHash, setTxHash] = useState<string>("")

  const sendTx = useMutation(async (sign) => {
    return await new Promise(async (resolve, reject) => {
      try {
        const unsubscribe = await sign.send(async (result) => {
          if (!result || !result.status) return

          const timeout = setTimeout(() => {
            clearTimeout(timeout)
            reject(new UnknownTransactionState())
          }, 60000)

          if (isMounted()) {
            setTxHash(result.txHash.toHex())
            setTxState(result.status.type)
          } else {
            clearTimeout(timeout)
          }

          const onComplete = createResultOnCompleteHandler(api, {
            onError: (error) => {
              clearTimeout(timeout)
              reject(error)
            },
            onSuccess: (result) => {
              clearTimeout(timeout)
              resolve(result)
            },
            onSettled: unsubscribe,
          })

          return onComplete(result)
        })
      } catch (err) {
        reject(err?.toString() ?? "Unknown error")
      }
    })
  }, options)

  const txLink = txHash
    ? `${getSubscanLinkByType("extrinsic")}/${txHash}`
    : undefined

  return {
    ...sendTx,
    txState,
    txLink,
    reset: () => {
      setTxState(null)
      setTxHash("")
      sendTx.reset()
    },
  }
}

function getReferralCodeFromTx(tx: SubmittableExtrinsic<"promise">) {
  if (!tx) return null

  let code = null
  try {
    const json: any = tx.method.toHuman()
    const calls: any[] = Array.isArray(json?.args?.calls) ? json.args.calls : []
    const referralCall = calls.find(
      ({ method, section, args }) =>
        method === "linkCode" && section === "referrals" && !!args.code,
    )
    code = referralCall?.args?.code ?? null
  } catch {
    return null
  }

  return code
}

const useBoundReferralToast = () => {
  const { t } = useTranslation()
  const { loading, success, remove } = useToast()

  const pendingToastId = useRef<string>()
  const pendingReferralCode = useRef<string>()

  const onLoading = (tx: SubmittableExtrinsic<"promise">) => {
    const code = getReferralCodeFromTx(tx)

    if (code) {
      pendingReferralCode.current = code
      pendingToastId.current = loading({
        hideTime: 3000,
        title: (
          <span>
            {t("referrals.toasts.linkCode.onLoading", {
              code,
            })}
          </span>
        ),
      })
    }
  }

  const onSuccess = () => {
    if (pendingToastId.current) {
      remove(pendingToastId.current)
      success({
        title: (
          <span>
            {t("referrals.toasts.linkCode.onSuccess", {
              code: pendingReferralCode.current,
            })}
          </span>
        ),
      })
    }
  }

  return {
    onLoading,
    onSuccess,
  }
}

const useErrorToastUpdate = (id: string) => {
  const { edit } = useToast()

  return (err: TransactionError) => {
    if (err?.method) {
      defer(() => {
        edit(id, {
          description: (
            <p>
              <strong>{err.method}</strong>
              {err.docs ? ` - ${err.docs}` : ""}
            </p>
          ),
        })
      })
    }
  }
}

export const useSendTx = ({ id }: { id: string }) => {
  const [txType, setTxType] = useState<"default" | "evm" | "permit" | null>(
    null,
  )

  const boundReferralToast = useBoundReferralToast()
  const updateErrorToast = useErrorToastUpdate(id)

  const sendTx = useSendTransactionMutation({
    onMutate: (tx) => {
      boundReferralToast.onLoading(tx)
      setTxType("default")
    },
    onSuccess: boundReferralToast.onSuccess,
    onError: updateErrorToast,
  })

  const sendEvmTx = useSendEvmTransactionMutation({
    onMutate: ({ tx }) => {
      if (tx) boundReferralToast.onLoading(tx)
      setTxType("evm")
    },
    onSuccess: boundReferralToast.onSuccess,
    onError: updateErrorToast,
  })

  const sendPermitTx = useSendDispatchPermit({
    onMutate: () => {
      setTxType("permit")
    },
  })

  const activeMutation =
    txType === "default" ? sendTx : txType === "evm" ? sendEvmTx : sendPermitTx

  return {
    sendTx: sendTx.mutateAsync,
    sendEvmTx: sendEvmTx.mutateAsync,
    sendPermitTx: sendPermitTx.mutateAsync,
    ...activeMutation,
  }
}
