import { queryOptions } from "@tanstack/react-query"

import { fetchRpcInfo, pingRpc } from "@/utils/rpc"

export const rpcInfoQuery = (url: string) =>
  queryOptions({
    queryKey: ["pingRpc", url],
    queryFn: async () => {
      const [ping, info] = await Promise.all([pingRpc(url), fetchRpcInfo(url)])
      return {
        ping,
        ...info,
      }
    },
  })
