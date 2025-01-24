import {
  AssetClient,
  BalanceClient,
  PoolService,
  PoolType,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { queryOptions } from "@tanstack/react-query"

import { PROVIDERS } from "@/config/rpc"

export type TDataEnv = "testnet" | "paseo" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string[]
  dataEnv: TDataEnv
}

export type TFeatureFlags = {
  dispatchPermit: boolean
}

export type TProviderData = Awaited<ReturnType<typeof getProviderData>>

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const getProviderProps = (url: string) =>
  PROVIDERS.find((p) => p.url === url)

type ProviderQueryOptions = {
  onSuccess?: (endpoint: string) => void
}

export const providerQuery = (
  rpcUrlList: string[],
  options: ProviderQueryOptions = {},
) => {
  return queryOptions({
    queryKey: ["provider", rpcUrlList.join()],
    queryFn: async () => {
      const data = await getProviderData(rpcUrlList)
      const provider = getProviderInstance(data.api)

      options.onSuccess?.(provider.endpoint)

      return data
    },
    enabled: !!rpcUrlList.length,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

const getProviderData = async (rpcUrlList: string[]) => {
  const maxRetries = rpcUrlList.length * 5
  const apiPool = SubstrateApis.getInstance()
  const api = await apiPool.api(rpcUrlList, maxRetries)

  const provider = getProviderInstance(api)

  const endpoint = provider.endpoint

  api.registry.register({
    XykLMDeposit: {
      shares: "u128",
      ammPoolId: "AccountId",
      yieldFarmEntries: "Vec<PalletLiquidityMiningYieldFarmEntry>",
    },
    OmnipoolLMDeposit: {
      shares: "u128",
      ammPoolId: "u32",
      yieldFarmEntries: "Vec<PalletLiquidityMiningYieldFarmEntry>",
    },
  })

  const poolService = new PoolService(api)
  const traderRoutes = [
    PoolType.Omni,
    PoolType.Stable,
    PoolType.XYK,
    PoolType.LBP,
  ]

  const tradeRouter = new TradeRouter(poolService, {
    includeOnly: traderRoutes,
  })

  // await poolService.syncRegistry(externalTokens[dataEnv])

  const [isDispatchPermitEnabled] = await Promise.all([
    api.tx.multiTransactionPayment.dispatchPermit,
    //tradeRouter.getPools(),
  ])

  const balanceClient = new BalanceClient(api)
  const assetClient = new AssetClient(api)

  return {
    api,
    tradeRouter,
    poolService,
    balanceClient,
    assetClient,
    rpcUrlList,
    endpoint,
    dataEnv: PROVIDERS.find((p) => p.url === endpoint)?.dataEnv ?? "mainnet",
    featureFlags: {
      dispatchPermit: !!isDispatchPermitEnabled,
    },
  }
}

export function getProviderInstance(api: ApiPromise) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const options = api?._options
  return options?.provider as WsProvider
}

export async function reconnectProvider(provider: WsProvider) {
  if (provider?.isConnected) return
  await provider.connect()
  await new Promise((resolve) => {
    if (provider.isConnected) {
      resolve(provider)
    } else {
      provider.on("connected", () => {
        resolve(provider)
      })
    }
  })
}

export async function changeProvider(prevUrl: string, nextUrl: string) {
  if (prevUrl === nextUrl) return
  const apiPool = SubstrateApis.getInstance()
  const prevApi = await apiPool.api(prevUrl)

  if (prevApi && prevApi.isConnected) {
    await prevApi.disconnect()
  }

  const nextApi = await apiPool.api(nextUrl)

  if (nextApi && !nextApi.isConnected) {
    await reconnectProvider(getProviderInstance(nextApi))
  }
}
