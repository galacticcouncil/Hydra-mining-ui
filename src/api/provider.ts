import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { useMemo } from "react"
import { useShallow } from "hooks/useShallow"
import { pick, uniqBy } from "utils/rx"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { useRpcProvider } from "providers/rpcProvider"
import {
  AssetClient,
  BalanceClient,
  PoolService,
  PoolType,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { useUserExternalTokenStore } from "sections/wallet/addToken/AddToken.utils"
import { useAssetRegistry, useSettingsStore } from "state/store"
import { identity, undefinedNoop } from "utils/helpers"
import { ExternalAssetCursor } from "@galacticcouncil/apps"
import { getExternalId } from "utils/externalAssets"
import { pingRpc } from "utils/rpc"

export type TEnv = "testnet" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string | string[]
  dataEnv: TEnv
}

export type TFeatureFlags = {
  dispatchPermit: boolean
} & { [key: string]: boolean }

export const PASEO_WS_URL = "paseo-rpc.play.hydration.cloud"

export const PROVIDERS: ProviderProps[] = [
  {
    name: "GalacticCouncil",
    url: "wss://rpc.hydradx.cloud",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Dwellir",
    url: "wss://hydration-rpc.n.dwellir.com",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Helikon",
    url: "wss://rpc.helikon.io/hydradx",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Dotters",
    url: "wss://hydration.dotters.network",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Testnet",
    url: "wss://rpc.nice.hydration.cloud",
    indexerUrl: "https://archive.nice.hydration.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: ["development"],
    dataEnv: "testnet",
  },
  {
    name: "Max Lark Testnet",
    url: "wss://max.lark.hydration.cloud",
    indexerUrl: "https://archive.nice.hydration.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-testnet-pools:dev/api/graphql",
    env: ["development"],
    dataEnv: "testnet",
  },
  {
    name: "Paseo",
    url: `wss://${PASEO_WS_URL}`,
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql",
    env: ["rococo", "development"],
    dataEnv: "testnet",
  },
]

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  typeof provider.env === "string"
    ? provider.env === import.meta.env.VITE_ENV
    : provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const isTestnetRpcUrl = (url: string) =>
  PROVIDERS.find((provider) => provider.url === url)?.dataEnv === "testnet"

export async function pingAllProvidersAndSort() {
  const fastestRpc = await Promise.race(
    PROVIDER_URLS.map(async (url) => {
      const time = await pingRpc(url)
      return { url, time }
    }),
  )

  const sortedRpcList = uniqBy(identity, [fastestRpc.url, ...PROVIDER_URLS])
  useProviderRpcUrlStore.getState().setRpcUrlList(sortedRpcList, Date.now())
}

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl: string
    rpcUrlList: string[]
    autoMode: boolean
    updatedAt: number
    setRpcUrl: (rpcUrl: string | undefined) => void
    setRpcUrlList: (rpcUrlList: string[], updatedAt: number) => void
    getDataEnv: () => TEnv
    setAutoMode: (state: boolean) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      rpcUrlList: [],
      updatedAt: 0,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setRpcUrlList: (rpcUrlList, updatedAt) => set({ rpcUrlList, updatedAt }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl } = get()
        return (
          PROVIDERS.find((provider) => provider.url === rpcUrl)?.dataEnv ??
          "mainnet"
        )
      },
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      version: 3.2,
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)

export const useActiveRpcUrlList = () => {
  const { autoMode, rpcUrl, rpcUrlList } = useProviderRpcUrlStore(
    useShallow((state) => pick(state, ["autoMode", "rpcUrl", "rpcUrlList"])),
  )
  return autoMode ? rpcUrlList : [rpcUrl]
}

export const useIsTestnet = () => {
  const rpcUrlList = useActiveRpcUrlList()
  return isTestnetRpcUrl(rpcUrlList[0])
}

export const useProviderAssets = () => {
  const { data: provider } = useProviderData()
  const rpcUrlList = useActiveRpcUrlList()

  return useQuery(
    QUERY_KEYS.assets(rpcUrlList.join()),
    provider
      ? async () => {
          const dataEnv = useProviderRpcUrlStore.getState().getDataEnv()
          const degenMode = useSettingsStore.getState().degenMode
          const { tokens: externalTokens } = degenMode
            ? ExternalAssetCursor.deref().state
            : useUserExternalTokenStore.getState()

          const assetClient = new AssetClient(provider.api)

          return await Promise.all([
            provider.tradeRouter.getAllAssets(),
            assetClient.getOnChainAssets(true, externalTokens[dataEnv]),
          ])
        }
      : undefinedNoop,
    {
      enabled: !!provider,
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 1,
      onSuccess: (data) => {
        const [tradeAssets, sdkAssets] = data ?? []
        if (sdkAssets?.length && tradeAssets?.length) {
          const { sync } = useAssetRegistry.getState()

          sync(
            sdkAssets.map((asset) => {
              const isTradable = tradeAssets.some(
                (tradeAsset) => tradeAsset.id === asset.id,
              )
              return {
                ...asset,
                symbol: asset.symbol ?? "",
                decimals: asset.decimals ?? 0,
                name: asset.name ?? "",
                externalId: getExternalId(asset),
                isTradable,
              }
            }),
          )
        }
      },
    },
  )
}

export const useProviderData = () => {
  const rpcUrlList = useActiveRpcUrlList()
  const { setRpcUrl } = useProviderRpcUrlStore()

  return useQuery(
    QUERY_KEYS.provider(rpcUrlList.join()),
    async () => {
      const maxRetries = rpcUrlList.length * 5
      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(rpcUrlList, maxRetries)

      const dataEnv = useProviderRpcUrlStore.getState().getDataEnv()
      const degenMode = useSettingsStore.getState().degenMode
      const { tokens: externalTokens } = degenMode
        ? ExternalAssetCursor.deref().state
        : useUserExternalTokenStore.getState()

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
      await poolService.syncRegistry(externalTokens[dataEnv])

      const tradeRouter = new TradeRouter(poolService, {
        includeOnly: traderRoutes,
      })

      const [isDispatchPermitEnabled] = await Promise.all([
        api.tx.multiTransactionPayment.dispatchPermit,
        tradeRouter.getPools(),
      ])

      const balanceClient = new BalanceClient(api)

      return {
        api,
        tradeRouter,
        poolService,
        balanceClient,
        featureFlags: {
          dispatchPermit: !!isDispatchPermitEnabled,
        } as TFeatureFlags,
      }
    },
    {
      enabled: rpcUrlList.length > 0,
      refetchOnWindowFocus: false,
      retry: false,
      onSettled: (data) => {
        if (data?.api) {
          const provider = getProviderInstance(data.api)
          setRpcUrl(provider.endpoint)
        }
      },
    },
  )
}

export const useRefetchProviderData = () => {
  const queryClient = useQueryClient()
  const rpcList = useActiveRpcUrlList()

  return () => {
    queryClient.invalidateQueries(QUERY_KEYS.provider(rpcList.join()))
    queryClient.invalidateQueries(QUERY_KEYS.assets(rpcList.join()))
  }
}

export const useIndexerUrl = () => {
  const activeProvider = useActiveProvider()
  return activeProvider.indexerUrl
}

export const useSquidUrl = () => {
  const activeProvider = useActiveProvider()
  return activeProvider.squidUrl
}

export const useActiveProvider = (): ProviderProps => {
  const { api, isLoaded } = useRpcProvider()

  const activeRpcUrl = useMemo(() => {
    if (!isLoaded) return undefined

    let rpcUrl = import.meta.env.VITE_PROVIDER_URL
    try {
      const provider = api ? getProviderInstance(api) : null
      if (provider?.endpoint) {
        rpcUrl = provider.endpoint
      }
    } catch (e) {}
    return rpcUrl
  }, [api, isLoaded])

  return (
    PROVIDERS.find((provider) => provider.url === activeRpcUrl) || {
      name: "",
      url: import.meta.env.VITE_PROVIDER_URL,
      indexerUrl: import.meta.env.VITE_INDEXER_URL,
      squidUrl: import.meta.env.VITE_SQUID_URL,
      env: import.meta.env.VITE_ENV,
      dataEnv:
        import.meta.env.VITE_ENV === "production" ? "mainnet" : "testnet",
    }
  )
}

export function getProviderInstance(api: ApiPromise) {
  // @ts-ignore
  const options = api?._options
  return options?.provider as WsProvider
}

export const useProviderPing = (urls: string[], timeoutMs?: number) => {
  return useQuery(["providerPing", urls], async () => {
    return Promise.all(
      urls.map(async (url) => {
        const time = await pingRpc(url, timeoutMs)
        return { url, time }
      }),
    )
  })
}
