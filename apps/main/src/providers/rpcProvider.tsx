import {
  AssetClient,
  type PoolService,
  type TradeRouter,
} from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, ReactNode, useContext, useMemo } from "react"
import { usePrevious } from "react-use"

import {
  changeProvider,
  getProviderProps,
  PROVIDER_URLS,
  providerQuery,
  TDataEnv,
  TFeatureFlags,
} from "@/api/provider"
import { useAssetRegistry } from "@/states/assetRegistry"
import { useDisplayAssetStore } from "@/states/displayAsset"
import { useProviderRpcUrlStore } from "@/states/provider"

export type TProviderContext = {
  api: ApiPromise
  tradeRouter: TradeRouter
  poolService: PoolService
  isLoaded: boolean
  isApiLoaded: boolean
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  assetClient: AssetClient
  endpoint: string
  dataEnv: TDataEnv
}

const defaultData: TProviderContext = {
  isLoaded: false,
  isApiLoaded: false,
  api: {} as TProviderContext["api"],
  tradeRouter: {} as TradeRouter,
  featureFlags: { dispatchPermit: false } as TProviderContext["featureFlags"],
  poolService: {} as TProviderContext["poolService"],
  assetClient: {} as TProviderContext["assetClient"],
  rpcUrlList: [],
  endpoint: "",
  dataEnv: "mainnet",
}

const ProviderContext = createContext<TProviderContext>(defaultData)

export const useRpcProvider = () => useContext(ProviderContext)

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const { assets } = useAssetRegistry()
  const isAssets = !!assets.length
  const { setRpcUrl, rpcUrl, autoMode } = useProviderRpcUrlStore()
  const rpcUrlList = autoMode ? PROVIDER_URLS : [rpcUrl]

  const queryClient = useQueryClient()
  const prevRpcUrl = usePrevious(rpcUrl)

  const { data } = useQuery(
    providerQuery(rpcUrlList, {
      onSuccess: async (url) => {
        setRpcUrl(url)

        if (prevRpcUrl && prevRpcUrl !== url) {
          await changeProvider(prevRpcUrl, url)

          const prevDataEnv = getProviderProps(prevRpcUrl)?.dataEnv
          const nextDataEnv = getProviderProps(url)?.dataEnv

          if (!nextDataEnv || nextDataEnv !== prevDataEnv) {
            queryClient.invalidateQueries({
              queryKey: ["assets"],
            })
          }
        }
      },
    }),
  )

  const displayAsset = useDisplayAssetStore()

  const value = useMemo(() => {
    if (data) {
      const {
        isStableCoin,
        stableCoinId: chainStableCoinId,
        update,
      } = displayAsset

      let stableCoinId: string | undefined

      //set USDT as a stable token
      stableCoinId = assets.find((asset) => asset.symbol === "USDT")?.id

      // set DAI as a stable token if there is no USDT
      if (!stableCoinId) {
        stableCoinId = assets.find((asset) => asset.symbol === "DAI")?.id
      }

      if (stableCoinId && isStableCoin && chainStableCoinId !== stableCoinId) {
        // setting stable coin id from asset registry
        update({
          id: stableCoinId,
          symbol: "$",
          isRealUSD: false,
          isStableCoin: true,
          stableCoinId,
        })
      }

      return {
        ...data,
        isApiLoaded: !!Object.keys(data.api).length,
        isLoaded: isAssets,
      }
    }

    return defaultData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isAssets])

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
