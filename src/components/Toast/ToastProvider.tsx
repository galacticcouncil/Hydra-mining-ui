import { FC, PropsWithChildren, useEffect, useRef, useState } from "react"
import { ToastViewport } from "components/Toast/ToastViewport"
import { Provider } from "@radix-ui/react-toast"
import { useToast } from "state/toasts"
import { Toast } from "components/Toast/Toast"
import { AnimatePresence, domAnimation, LazyMotion } from "framer-motion"

import { ToastSidebar } from "./sidebar/ToastSidebar"
import { useBridgeToast, useProcessToasts } from "./Toast.utils"
import { useStore } from "state/store"

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { toasts, toastsTemp, hide, sidebar, setSidebar } = useToast()
  const { transactions } = useStore()

  const bridgeToasts = toasts.filter(
    (toast) => toast.bridge && toast.variant === "progress",
  )

  const progressToasts = toasts.filter((toast) => {
    return (
      !toast.bridge &&
      toast.variant === "progress" &&
      !transactions?.find((transaction) => transaction.id === toast.id)
    )
  })

  useBridgeToast(bridgeToasts)
  useProcessToasts(progressToasts)

  const activeToasts = [...toastsTemp, ...toasts.filter((i) => !i.hidden)]
  const toast = activeToasts[0]

  const [toastSeenInGroupCount, setToastSeenInGroupCount] = useState(0)

  const currId = toast?.id ?? null
  const lastToastId = useRef<string | null>(currId)
  const lastToastUpdate = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    // ignore quick toast change, user probably hasn't read it within 50ms
    if (Math.abs(now - lastToastUpdate.current) > 50) {
      const prevId = lastToastId.current
      if (prevId !== currId) {
        // if previous toast is null = new session, reset to 0
        // otherwise new toast is in the same "session"
        setToastSeenInGroupCount(prevId == null ? 0 : (counter) => counter + 1)
      }
      lastToastId.current = currId
    }

    lastToastUpdate.current = now
  }, [currId])

  return (
    <>
      <Provider duration={0}>
        <ToastViewport />
        <LazyMotion features={domAnimation}>
          <AnimatePresence>
            {!sidebar && toast && (
              <Toast
                index={1 + toastSeenInGroupCount}
                link={toast.link}
                count={activeToasts.length + toastSeenInGroupCount}
                key={toast.id}
                variant={toast.variant}
                title={toast.title}
                actions={toast.actions}
                onClick={() => setSidebar(true)}
                onClose={() => hide(toast.id)}
                persist={toast.persist}
                dateCreated={new Date(toast.dateCreated)}
                hideTime={toast.hideTime}
              />
            )}
          </AnimatePresence>
        </LazyMotion>
      </Provider>
      {children}
      <ToastSidebar />
    </>
  )
}
