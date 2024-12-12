import {
  TransactionReceipt,
  TransactionResponse,
  Web3Provider,
} from "@ethersproject/providers"
import { chainsMap, tags } from "@galacticcouncil/xcm-cfg"
import { AccountId32, Hash } from "@open-web3/orml-types/interfaces"
import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import type { AnyJson } from "@polkadot/types-codec/types"
import { ExtrinsicStatus } from "@polkadot/types/interfaces"
import { ISubmittableResult } from "@polkadot/types/types"
import {
  MutationObserverOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useAssets } from "providers/assets"
import { useShallow } from "hooks/useShallow"
import { useRpcProvider } from "providers/rpcProvider"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useUserExternalTokenStore } from "sections/wallet/addToken/AddToken.utils"
import {
  useEvmAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import {
  EthereumSigner,
  PermitResult,
} from "sections/web3-connect/signer/EthereumSigner"
import { ToastMessage, useSettingsStore } from "state/store"
import { useToast } from "state/toasts"
import {
  H160,
  getEvmChainById,
  getEvmTxLink,
  isEvmAccount,
  isEvmWalletExtension,
} from "utils/evm"
import { isAnyParachain, Maybe } from "utils/helpers"
import { createSubscanLink } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import { useIsTestnet } from "api/provider"
import { useMountedState } from "react-use"

const EVM_PERMIT_BLOCKTIME = 20_000

type TxMethod = AnyJson & {
  method: string
  section: string
  args: { [key: string]: AnyJson }
}

function isTxMethod(x: AnyJson): x is TxMethod {
  return typeof x === "object" && x != null && "method" in x && "section" in x
}

export type TTxErrorData = {
  [key: string]: string | number | boolean | null | undefined
}

export class TransactionError extends Error {
  data: TTxErrorData

  constructor(message: string, data: TTxErrorData) {
    super(message)
    this.name = "TransactionError"
    this.data = data

    Object.setPrototypeOf(this, TransactionError.prototype)
  }
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
        let errorMessage = result.dispatchError.toString()

        if (result.dispatchError.isModule) {
          const decoded = api.registry.findMetaError(
            result.dispatchError.asModule,
          )
          errorMessage = `${decoded.section}.${
            decoded.method
          }: ${decoded.docs.join(" ")}`
        }

        onError(new Error(errorMessage))
      } else {
        onSuccess(result)
      }

      onSettled()
    }
  }

export const useSendEvmTransactionMutation = (
  options: MutationObserverOptions<
    ISubmittableResult,
    unknown,
    {
      evmTx: TransactionResponse
      tx?: SubmittableExtrinsic<"promise">
    }
  > = {},
  id: string,
  toast?: ToastMessage,
  xcallMeta?: Record<string, string>,
) => {
  const { t } = useTranslation()
  const { loading, success, error, remove, sidebar } = useToast()
  const [isBroadcasted, setIsBroadcasted] = useState(false)

  const { account } = useEvmAccount()
  const isTestnet = useIsTestnet()

  const isMounted = useMountedState()

  const sendTx = useMutation(async ({ evmTx }) => {
    return await new Promise(async (resolve, reject) => {
      try {
        const txHash = evmTx?.hash
        const txData = evmTx?.data

        const isSnowBridge = xcallMeta?.tags === tags.Tag.Snowbridge
        const chain = account?.chainId ? getEvmChainById(account.chainId) : null
        const link =
          txHash && chain
            ? getEvmTxLink(txHash, txData, chain.key, isTestnet, isSnowBridge)
            : ""

        const isApproveTx = txData?.startsWith("0x095ea7b3")

        const destChain = xcallMeta?.dstChain
          ? chainsMap.get(xcallMeta.dstChain)
          : undefined

        const xcm = xcallMeta ? "evm" : undefined

        const bridge =
          chain?.isEvmChain() || destChain?.isEvmChain()
            ? chain?.key
            : undefined

        loading({
          id,
          title: toast?.onLoading ?? <p>{t("toast.pending")}</p>,
          link,
          txHash,
          bridge: isApproveTx || isSnowBridge ? undefined : bridge,
          hidden: true,
          xcm,
        })

        setIsBroadcasted(true)

        const receipt = await evmTx.wait()

        if (isMounted() && !xcm) {
          success({
            title: toast?.onSuccess ?? <p>{t("toast.success")}</p>,
            link,
            txHash,
            hidden: sidebar,
          })

          remove(id)
        }

        return resolve(evmTxReceiptToSubmittableResult(receipt))
      } catch (err) {
        error({
          title: toast?.onSuccess ?? <p>{t("toast.success")}</p>,
          hidden: sidebar,
        })
        reject(
          new TransactionError(err?.toString() ?? "Unknown error", {
            from: evmTx.from,
            to: evmTx.to,
            gasLimit: evmTx.gasLimit?.toString(),
            data: evmTx.data,
            ...xcallMeta,
          }),
        )
      }
    })
  }, options)

  return {
    ...sendTx,
    isBroadcasted,
  }
}

export function useNextEvmPermitNonce(account: Maybe<AccountId32 | string>) {
  const { wallet } = useWallet()

  return useQuery(
    QUERY_KEYS.nextEvmPermitNonce(account),
    async () => {
      if (!account) throw new Error("Missing address")
      if (!wallet?.signer) throw new Error("Missing wallet signer")
      if (!(wallet?.signer instanceof EthereumSigner))
        throw new Error("Invalid signer")

      return wallet.signer.getPermitNonce()
    },
    {
      refetchInterval: EVM_PERMIT_BLOCKTIME,
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
      enabled: isEvmAccount(account?.toString()),
    },
  )
}

export const usePendingDispatchPermit = (
  address: Maybe<AccountId32 | string>,
) => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.pendingEvmPermit(address),
    async () => {
      const raw = await api.rpc.author.pendingExtrinsics()
      const pendingExtrinsics = raw.toHuman()

      if (!Array.isArray(pendingExtrinsics)) return null

      const pendingPermit = pendingExtrinsics.find((ext: AnyJson) => {
        if (!isTxExtrinsic(ext)) return false

        const evmAddress = address ? H160.fromAccount(address.toString()) : ""
        const fromAddress = ext?.method?.args?.from?.toString() ?? ""

        return (
          ext?.method?.section === "multiTransactionPayment" &&
          ext?.method?.method === "dispatchPermit" &&
          fromAddress.toLowerCase() === evmAddress.toLowerCase()
        )
      }) as TxExtrinsic

      return pendingPermit ?? null
    },
    {
      refetchInterval: EVM_PERMIT_BLOCKTIME,
      refetchOnWindowFocus: false,
      enabled: isLoaded && isEvmAccount(address?.toString()),
    },
  )
}

const getTransactionData = (
  result: ISubmittableResult,
  xcallMeta?: Record<string, string>,
) => {
  const status = result.status
  const txHash = result.txHash.toHex()

  const srcChain = chainsMap.get(xcallMeta?.srcChain ?? "hydration")

  const xcmDstChain = xcallMeta?.dstChain
    ? chainsMap.get(xcallMeta.dstChain)
    : undefined

  const link =
    txHash && srcChain
      ? createSubscanLink("extrinsic", txHash, srcChain.key)
      : undefined

  const isSnowBridge = xcallMeta?.tags === tags.Tag.Snowbridge

  const bridge =
    xcmDstChain?.isEvmChain() && !isSnowBridge ? "substrate" : undefined

  const xcm: "substrate" | undefined = xcallMeta ? "substrate" : undefined

  return {
    status,
    txHash,
    srcChain,
    xcmDstChain,
    link,
    bridge,
    xcm,
  }
}

export const useSendDispatchPermit = (
  options: MutationObserverOptions<
    ISubmittableResult,
    unknown,
    {
      permit: PermitResult
    }
  > = {},
  id: string,
  toast?: ToastMessage,
  xcallMeta?: Record<string, string>,
) => {
  const { api } = useRpcProvider()
  const { wallet } = useWallet()
  const { t } = useTranslation()
  const { loading, success, error, remove, sidebar } = useToast()
  const queryClient = useQueryClient()
  const [isBroadcasted, setIsBroadcasted] = useState(false)

  const unsubscribeRef = useRef<null | (() => void)>(null)

  const sendTx = useMutation(async ({ permit }) => {
    return await new Promise(async (resolve, reject) => {
      try {
        let isLoadingNotified = false

        const extrinsic = api.tx.multiTransactionPayment.dispatchPermit(
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
        const unsubscribe = await extrinsic.send(async (result) => {
          if (!result || !result.status) return

          const isInBlock = result.status.type === "InBlock"

          const { status, txHash, link, bridge, xcm } = getTransactionData(
            result,
            xcallMeta,
          )

          if (status.isBroadcast && txHash && !isLoadingNotified) {
            loading({
              id,
              title: toast?.onLoading ?? <p>{t("toast.pending")}</p>,
              link,
              txHash,
              bridge,
              hidden: true,
              xcm,
            })

            isLoadingNotified = true
            setIsBroadcasted(true)
          }

          const account = new H160(permit.message.from).toAccount()
          queryClient.setQueryData(
            QUERY_KEYS.pendingEvmPermit(account),
            extrinsic.toHuman(),
          )

          if (
            isInBlock &&
            wallet?.extension &&
            isEvmWalletExtension(wallet.extension)
          ) {
            await waitForEvmBlock(new Web3Provider(wallet.extension))
          }

          // stop checking for pending permits until the transaction is settled
          queryClient.setQueryDefaults(QUERY_KEYS.pendingEvmPermit(account), {
            refetchInterval: 0,
          })

          const onComplete = createResultOnCompleteHandler(api, {
            onError: async (e) => {
              error({
                title: toast?.onError ?? <p>{t("toast.error")}</p>,
                link,
                txHash,
                hidden: sidebar,
              })

              remove(id)

              reject(e)
            },
            onSuccess: async (result) => {
              if (!xcm) {
                success({
                  title: toast?.onSuccess ?? <p>{t("toast.success")}</p>,
                  link,
                  txHash,
                  hidden: sidebar,
                })

                remove(id)
              }

              resolve(result)
            },
            onSettled: async () => {
              unsubscribe()

              queryClient.invalidateQueries(
                QUERY_KEYS.nextEvmPermitNonce(account),
              )
              queryClient.invalidateQueries(
                QUERY_KEYS.pendingEvmPermit(account),
              )
              queryClient.setQueryDefaults(
                QUERY_KEYS.pendingEvmPermit(account),
                {
                  refetchInterval: EVM_PERMIT_BLOCKTIME,
                },
              )
            },
          })

          unsubscribeRef.current = unsubscribe

          return onComplete(result)
        })
      } catch (err) {
        error({
          title: toast?.onSuccess ?? <p>{t("toast.success")}</p>,
          hidden: sidebar,
        })
        reject(
          new TransactionError(
            err?.toString() ?? "Unknown error",
            permit.message,
          ),
        )
      }
    })
  }, options)

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.()
    }
  }, [])

  return {
    ...sendTx,
    isBroadcasted,
  }
}

export const useSendTransactionMutation = (
  options: MutationObserverOptions<
    ISubmittableResult,
    unknown,
    {
      tx: SubmittableExtrinsic<"promise">
    }
  > = {},
  id: string,
  toast?: ToastMessage,
  xcallMeta?: Record<string, string>,
) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { loading, success, error, remove, sidebar } = useToast()
  const [isBroadcasted, setIsBroadcasted] = useState(false)

  const unsubscribeRef = useRef<null | (() => void)>(null)

  const sendTx = useMutation(async ({ tx }) => {
    return await new Promise(async (resolve, reject) => {
      try {
        let isLoadingNotified = false

        const unsubscribe = await tx.send(async (result) => {
          if (!result || !result.status) return

          const { status, txHash, srcChain, link, bridge, xcm } =
            getTransactionData(result, xcallMeta)

          if (status.isBroadcast && txHash && !isLoadingNotified) {
            loading({
              id,
              title: toast?.onLoading ?? <p>{t("toast.pending")}</p>,
              link,
              txHash,
              bridge,
              hidden: true,
              xcm,
            })

            isLoadingNotified = true
            setIsBroadcasted(true)
          }

          const apiPromise =
            xcallMeta &&
            srcChain &&
            xcallMeta.srcChain !== "hydration" &&
            isAnyParachain(srcChain)
              ? await srcChain.api
              : api

          const onComplete = createResultOnCompleteHandler(apiPromise, {
            onError: (e) => {
              error({
                title: toast?.onError ?? <p>{t("toast.error")}</p>,
                link,
                txHash,
                hidden: sidebar,
              })

              remove(id)

              reject(e)
            },
            onSuccess: (result) => {
              if (!xcm) {
                success({
                  title: toast?.onSuccess ?? <p>{t("toast.success")}</p>,
                  link,
                  txHash,
                  hidden: sidebar,
                })

                remove(id)
              }

              resolve(result)
            },
            onSettled: unsubscribe,
          })

          unsubscribeRef.current = unsubscribe

          return onComplete(result)
        })
      } catch (err) {
        error({
          title: toast?.onSuccess ?? <p>{t("toast.success")}</p>,
          hidden: sidebar,
        })
        reject(
          new TransactionError(err?.toString() ?? "Unknown error", {
            method: getTransactionJSON(tx)?.method,
            call: tx.method.toHex(),
            callHash: tx.method.hash.toHex(),
          }),
        )
      }
    })
  }, options)

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.()
    }
  }, [])

  return {
    ...sendTx,
    isBroadcasted,
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

function getAssetIdsFromTx(tx: SubmittableExtrinsic<"promise">) {
  if (!tx) return []

  try {
    const { method, section }: any = tx.method.toHuman()
    const json: any = tx.method.toJSON()
    const callName = `${section}.${method}`

    switch (callName) {
      case "router.sell":
      case "router.buy":
        return [json.args.asset_in, json.args.asset_out]
          .filter(Boolean)
          .map(String)
      default:
        return []
    }
  } catch {
    return []
  }
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

const useStoreExternalAssetsOnSign = () => {
  const { getAssetWithFallback, isExternal } = useAssets()
  const { addToken, isAdded } = useUserExternalTokenStore()
  const degenMode = useSettingsStore(useShallow((s) => s.degenMode))

  return useCallback(
    (assetIds: string[]) => {
      if (!degenMode) return
      assetIds.forEach((id) => {
        const asset = getAssetWithFallback(id)
        const isExternal_ = isExternal(asset)
        if (isExternal_ && !isAdded(asset.externalId) && asset.externalId) {
          addToken({
            id: asset.externalId,
            decimals: asset.decimals,
            symbol: asset.symbol,
            name: asset.name,
            origin: Number(asset.parachainId),
            internalId: asset.id,
            isWhiteListed: !!asset.isWhiteListed,
          })
        }
      })
    },
    [addToken, degenMode, getAssetWithFallback, isAdded, isExternal],
  )
}

export const useSendTx = ({
  id,
  toast,
  onSuccess,
  onError,
  xcallMeta,
}: {
  id: string
  toast?: ToastMessage
  onSuccess?: (data: ISubmittableResult) => void
  onError?: () => void
  xcallMeta?: Record<string, string>
}) => {
  const [txType, setTxType] = useState<"default" | "evm" | "permit" | null>(
    null,
  )

  const boundReferralToast = useBoundReferralToast()
  const storeExternalAssetsOnSign = useStoreExternalAssetsOnSign()

  const sendTx = useSendTransactionMutation(
    {
      onMutate: ({ tx }) => {
        boundReferralToast.onLoading(tx)
        storeExternalAssetsOnSign(getAssetIdsFromTx(tx))
        setTxType("default")
      },
      onSuccess: (data) => {
        boundReferralToast.onSuccess()
        onSuccess?.(data)
      },
      onError: () => onError?.(),
    },
    id,
    toast,
    xcallMeta,
  )

  const sendEvmTx = useSendEvmTransactionMutation(
    {
      onMutate: ({ tx }) => {
        if (tx) {
          boundReferralToast.onLoading(tx)
          storeExternalAssetsOnSign(getAssetIdsFromTx(tx))
        }
        setTxType("evm")
      },
      onSuccess: (data) => {
        boundReferralToast.onSuccess()
        onSuccess?.(data)
      },
      onError: () => onError?.(),
    },
    id,
    toast,
    xcallMeta,
  )

  const sendPermitTx = useSendDispatchPermit(
    {
      onMutate: () => {
        setTxType("permit")
      },
      onSuccess: (data) => onSuccess?.(data),
      onError: () => onError?.(),
    },
    id,
    toast,
    xcallMeta,
  )

  const activeMutation =
    txType === "default" ? sendTx : txType === "evm" ? sendEvmTx : sendPermitTx

  return {
    sendTx: sendTx.mutateAsync,
    sendEvmTx: sendEvmTx.mutateAsync,
    sendPermitTx: sendPermitTx.mutateAsync,
    ...activeMutation,
  }
}

async function waitForEvmBlock(provider: Web3Provider): Promise<void> {
  const currentBlock = await provider.getBlockNumber()
  return new Promise((resolve, reject) => {
    const checkBlock = async () => {
      let timeout
      try {
        const newBlock = await provider.getBlockNumber()
        if (newBlock > currentBlock) {
          clearTimeout(timeout)
          resolve()
        } else {
          timeout = setTimeout(checkBlock, 5000)
        }
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    }

    checkBlock()
  })
}
