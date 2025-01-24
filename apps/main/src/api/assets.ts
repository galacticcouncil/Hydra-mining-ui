import { Bond, findNestedKey, HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"
import { useAssetRegistry } from "@/states/assetRegistry"
import { getExternalId } from "@/utils/externalAssets"

/**
 * Map of aTokens and their corresponding underlying asset ids
 */
export const A_TOKEN_UNDERLYING_ID_MAP_TESTNET: { [key: string]: string } = {
  // aDOT
  "1000037": "5",
  // aUSDT
  "1000039": "10",
  // aUSDC
  "1000038": "21",
  // aWBTC
  "1000040": "3",
  // aWETH
  "1000041": "20",
  //avDOT
  "1005": "15",
}

export const A_TOKEN_UNDERLYING_ID_MAP_MAINNET: { [key: string]: string } = {
  // aDOT
  "1001": "5",
  // aUSDT
  "1002": "10",
  // aUSDC
  "1003": "22",
  // aWBTC
  "1004": "19",
  //avDOT
  "1005": "15",
}

export const A_TOKEN_UNDERLYING_ID_MAP =
  import.meta.env.VITE_ENV === "production"
    ? A_TOKEN_UNDERLYING_ID_MAP_MAINNET
    : A_TOKEN_UNDERLYING_ID_MAP_TESTNET

export type TAssetResouce = {
  baseUrl: string
  branch: string
  cdn: {
    [key: string]: string
  }
  path: string
  repository: string
  items: string[]
}

export enum AssetType {
  TOKEN = "Token",
  BOND = "Bond",
  STABLESWAP = "StableSwap",
  ERC20 = "Erc20",
  External = "External",
}

export enum AssetEcosystem {
  POLKADOT = "polkadot",
  ETHEREUM = "ethereum",
}

type TCommonAssetData = {
  id: string
  type: AssetType
  existentialDeposit: string
  symbol: string
  decimals: number
  name: string
  isTradable: boolean
  isSufficient: boolean
}

export type TToken = TCommonAssetData & {
  iconSrc?: string
  srcChain?: string
  parachainId?: string
  ecosystem: AssetEcosystem
}

export type TErc20 = TCommonAssetData & {
  underlyingAssetId?: string
}

export type TBond = TCommonAssetData & {
  underlyingAssetId: string
  maturity: number
}

export type TStableswap = TCommonAssetData & {
  underlyingAssetId?: string[]
}

export type TExternal = TCommonAssetData & {
  externalId?: string
}

export type TAssetData = TToken | TErc20 | TBond | TStableswap | TExternal

const BASE_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master"

const pathes = ["/assets-v2.json", "/chains-v2.json"] //, , "/metadata.json"

export const assetsQuery = (data: TProviderContext) => {
  const { assetClient, tradeRouter } = data

  return queryOptions({
    queryKey: ["assets"],
    queryFn:
      assetClient && tradeRouter
        ? async () => {
            const metadataQueries = pathes.map((path) =>
              fetch(BASE_URL + path).then((d) => d.json()),
            )
            const { sync, syncMetadata } = useAssetRegistry.getState()

            const [tradeAssets, assets, ...metadata] = await Promise.all([
              tradeRouter.getAllAssets(),
              assetClient.getOnChainAssets(true),
              ...metadataQueries,
            ])

            const assetsMetadata: TAssetResouce = metadata[0]
            const chainsMetadata: TAssetResouce = metadata[1]
            const { cdn, path, repository, items } = assetsMetadata

            const url = [cdn["jsDelivr"], repository + "@latest", path].join(
              "/",
            )

            const syncData = assets.map((asset): TAssetData => {
              const isTradable = tradeAssets.some(
                (tradeAsset) => tradeAsset.id === asset.id,
              )

              let parachainId: string | undefined
              let iconSrc: string | undefined
              let ecosystem = AssetEcosystem.POLKADOT

              const commonAssetData: TCommonAssetData = {
                id: asset.id,
                type: asset.type as AssetType,
                existentialDeposit: asset.existentialDeposit,
                symbol: asset.symbol ?? "",
                decimals: asset.decimals ?? 0,
                name: asset.name ?? "",
                isTradable,
                isSufficient: asset.isSufficient,
              }

              if (asset.type === AssetType.TOKEN) {
                parachainId = findNestedKey(
                  asset.location,
                  "parachain",
                )?.parachain.toString()

                const ethereumNetworkEntry = findNestedKey(
                  asset.location,
                  "ethereum",
                )

                if (ethereumNetworkEntry) {
                  const { ethereum } = ethereumNetworkEntry
                  ecosystem = AssetEcosystem.ETHEREUM

                  parachainId = findNestedKey(ethereum, "chainId")
                  const assetId = findNestedKey(asset.location, "key")
                  iconSrc = items.find((item) =>
                    item.includes(`${parachainId}/assets/${assetId}`),
                  )

                  return {
                    ...commonAssetData,
                    ecosystem,
                    ...(iconSrc ? { iconSrc } : {}),
                    ...(parachainId ? { parachainId } : {}),
                  }
                } else {
                  iconSrc = items.find((item) =>
                    item.includes(
                      `${HYDRADX_PARACHAIN_ID.toString()}/assets/${commonAssetData.id}`,
                    ),
                  )

                  const assetData: TToken = {
                    ...commonAssetData,
                    ecosystem,
                    ...(iconSrc ? { iconSrc } : {}),
                    ...(parachainId ? { parachainId } : {}),
                  }
                  return assetData
                }
              } else if (asset.type === AssetType.ERC20) {
                const underlyingAssetId = A_TOKEN_UNDERLYING_ID_MAP[asset.id]

                const assetData: TErc20 = {
                  ...commonAssetData,
                  ...(underlyingAssetId ? { underlyingAssetId } : {}),
                }

                return assetData
              } else if (asset.type === AssetType.BOND) {
                const bondData = asset as Bond
                const { underlyingAssetId, maturity } = bondData

                const assetData: TBond = {
                  ...commonAssetData,
                  underlyingAssetId,
                  maturity,
                }

                return assetData
              } else if (asset.type === AssetType.STABLESWAP) {
                const underlyingAssetId = asset?.meta
                  ? Object.keys(asset.meta)
                  : undefined

                const assetData: TStableswap = {
                  ...commonAssetData,
                  underlyingAssetId,
                }

                return assetData
              } else if (asset.type === AssetType.External) {
                const externalId = getExternalId(asset)

                const assetData: TExternal = {
                  ...commonAssetData,
                  ...(externalId ? { externalId } : {}),
                }

                return assetData
              } else {
                return commonAssetData
              }
            })
            console.log({ syncData })
            syncMetadata({ url, chainsMetadata })
            sync(syncData)

            // const [shareToken, poolAssets] = await Promise.all([
            //   api.query.xyk.shareToken.entries(),
            //   api.query.xyk.poolAssets.entries(),
            // ])

            // const shareTokens = shareToken
            //   .map(([key, shareTokenIdRaw]) => {
            //     const poolAddress = key.args[0].toString()
            //     const shareTokenId = shareTokenIdRaw.toString()

            //     const xykAssets = poolAssets.find(
            //       (xykPool) => xykPool[0].args[0].toString() === poolAddress,
            //     )?.[1]

            //     if (xykAssets)
            //       return {
            //         poolAddress,
            //         shareTokenId,
            //         assets: xykAssets.unwrap().map((asset) => asset.toString()),
            //       }

            //     return undefined
            //   })
            //   .filter(isNonNullish)

            // syncShareTokens(shareTokens)
            return []
          }
        : () => undefined,
    enabled: !!assetClient && !!tradeRouter,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
