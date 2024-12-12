import { create } from "zustand"
import React, { ReactElement, ReactNode, useMemo } from "react"
import { v4 as uuid } from "uuid"
import { renderToString } from "react-dom/server"
import { createJSONStorage, persist } from "zustand/middleware"
import { Maybe, safelyParse } from "utils/helpers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Trans } from "react-i18next"
import { ToastMessage } from "./store"

export const TOAST_MESSAGES = ["onLoading", "onSuccess", "onError"] as const
export type ToastVariant =
  | "info"
  | "success"
  | "error"
  | "progress"
  | "unknown"
  | "temporary"
export type ToastMessageType = (typeof TOAST_MESSAGES)[number]

type ToastParams = {
  id?: string
  link?: string
  title: ReactElement
  actions?: ReactNode
  persist?: boolean
  bridge?: string
  txHash?: string
  hideTime?: number
  hidden?: boolean
  xcm?: "evm" | "substrate"
}

export type ToastData = ToastParams & {
  id: string
  variant: ToastVariant
  hidden: boolean
  dateCreated: string
  title: string
}

type PersistState<T> = {
  version: number
  state: {
    toasts: Record<string, T>
  }
}

interface ToastStore {
  toasts: Record<string, Array<ToastData>>
  toastsTemp: Array<ToastData>
  update: (
    accoutAddress: Maybe<string>,
    callback: (toasts: Array<ToastData>) => Array<ToastData>,
  ) => void

  sidebar: boolean
  setSidebar: (value: boolean) => void
  updateToastsTemp: (
    callback: (toasts: Array<ToastData>) => Array<ToastData>,
  ) => void
}

const useToastsStore = create<ToastStore>()(
  persist(
    (set) => ({
      toasts: {},
      toastsTemp: [],
      sidebar: false,
      update(accoutAddress, callback) {
        set((state) => {
          const accountToasts = accoutAddress
            ? state.toasts[accoutAddress] ?? []
            : []
          const toasts = callback(accountToasts)

          return {
            toasts: {
              ...state.toasts,
              ...(!!accoutAddress && { [accoutAddress]: toasts }),
            },
          }
        })
      },
      updateToastsTemp: (callback) =>
        set((state) => ({ toastsTemp: callback(state.toastsTemp) })),
      setSidebar: (sidebar) =>
        set({
          sidebar,
        }),
    }),
    {
      name: "toasts",
      storage: createJSONStorage(() => ({
        async getItem(name: string) {
          const storeToasts = window.localStorage.getItem(name)
          const storeAccount = window.localStorage.getItem("web3-connect")

          if (!storeAccount) return storeToasts

          const { state: account } = JSON.parse(storeAccount)

          const accountAddress = account?.account?.address

          if (accountAddress) {
            if (storeToasts != null) {
              const { state: toastsState } =
                safelyParse<PersistState<ToastData[]>>(storeToasts) ?? {}

              const allToasts = { ...toastsState?.toasts }

              return JSON.stringify({
                ...toastsState,
                state: { toasts: allToasts },
              })
            } else {
              return JSON.stringify({
                version: 0,
                state: {
                  toasts: {
                    [accountAddress]: [],
                  },
                },
              })
            }
          }

          return storeToasts
        },
        setItem(name, value) {
          const parsedState = JSON.parse(value)

          const stringState = JSON.stringify({
            version: parsedState.version,
            state: { toasts: parsedState.state.toasts },
          })

          window.localStorage.setItem(name, stringState)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      })),
    },
  ),
)

export const useToast = () => {
  const store = useToastsStore()
  const { account } = useAccount()

  const toasts = useMemo(() => {
    if (account?.address) {
      return store.toasts[account.address] ?? []
    }
    return []
  }, [account?.address, store])

  const add = (variant: ToastVariant, toast: ToastParams) => {
    const id = toast.id ?? uuid()
    const dateCreated = new Date().toISOString()
    const title =
      typeof toast.title === "string"
        ? toast.title
        : renderToString(toast.title)

    if (variant !== "temporary") {
      store.update(account?.address, (toasts) => {
        // set max 10 toasts
        const prevToasts =
          toasts.length > 9
            ? toasts
                .sort(
                  (a, b) =>
                    new Date(b.dateCreated).getTime() -
                    new Date(a.dateCreated).getTime(),
                )
                .slice(0, 9)
            : [...toasts]

        return [
          {
            ...toast,
            variant,
            title,
            dateCreated,
            id,
            hidden: toast.hidden ?? store.sidebar,
          } as ToastData,
          ...prevToasts,
        ]
      })
    } else {
      store.updateToastsTemp((toasts) => {
        return [
          ...toasts,
          {
            ...toast,
            variant,
            title,
            dateCreated,
            id,
            hidden: toast.hidden ?? store.sidebar,
          } as ToastData,
        ]
      })
    }

    return id
  }

  const edit = (id: string, props: Partial<ToastData>) =>
    store.update(account?.address, (toasts) =>
      toasts.map((toast) => (toast.id === id ? { ...toast, ...props } : toast)),
    )

  const info = (toast: ToastParams) => add("info", toast)
  const success = (toast: ToastParams) => add("success", toast)
  const error = (toast: ToastParams) => add("error", toast)
  const loading = (toast: ToastParams) => add("progress", toast)
  const unknown = (toast: ToastParams) => add("unknown", toast)
  const temporary = (toast: ToastParams) => add("temporary", toast)

  const hide = (id: string) => {
    store.update(account?.address, (toasts) =>
      toasts.map((toast) =>
        toast.id === id ? { ...toast, hidden: true } : toast,
      ),
    )
    store.updateToastsTemp((toasts) =>
      toasts.filter((toast) => toast.id !== id),
    )
  }

  const remove = (id: string) => {
    store.update(account?.address, (toasts) =>
      toasts.filter((t) => t.id !== id),
    )
  }

  const setSidebar = (isOpen: boolean) => {
    if (isOpen) {
      store.update(account?.address, (toasts) =>
        toasts.map((toast) => ({ ...toast, hidden: true })),
      )
    }

    store.setSidebar(isOpen)
  }

  return {
    sidebar: store.sidebar,
    toasts,
    toastsTemp: store.toastsTemp,
    setSidebar,
    add,
    hide,
    remove,
    info,
    success,
    error,
    loading,
    unknown,
    temporary,
    edit,
  }
}

type TransProps = Omit<
  React.ComponentPropsWithRef<typeof Trans>,
  "components"
> & {
  components?: string[]
}

export const createToastMessages = (
  i18nKeyPrefix: string,
  options: TransProps,
) => {
  const { t, tOptions, components = [], ...rest } = options || {}

  return TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        tOptions={tOptions}
        {...rest}
        i18nKey={`${i18nKeyPrefix}.${msType}` as TransProps["i18nKey"]}
        components={components.map((tag) => {
          const [element, className] = tag.split(".")
          return React.createElement(element, { className })
        })}
      ></Trans>
    )
    return memo
  }, {} as ToastMessage)
}
