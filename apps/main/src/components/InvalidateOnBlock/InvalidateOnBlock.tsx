import { useQueryClient } from "@tanstack/react-query"
import { ReactNode, useEffect } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const InvalidateOnBlock = (props: { children: ReactNode }) => {
  const { isApiLoaded, api } = useRpcProvider()
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancel: () => void
    if (isApiLoaded) {
      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEY_BLOCK_PREFIX],
          })
        })
        .then((newCancel) => (cancel = newCancel))
    }
    return () => cancel?.()
  }, [api, isApiLoaded, queryClient])

  return <>{props.children}</>
}
