import { ProviderProps } from "@/api/provider"

export const PASEO_WS_URL = "paseo-rpc.play.hydration.cloud"

export const PROVIDERS: ProviderProps[] = [
  {
    name: "GalacticCouncil",
    url: "wss://rpc.hydradx.cloud",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: ["production"],
    dataEnv: "mainnet",
  },
  {
    name: "Dwellir",
    url: "wss://hydradx-rpc.dwellir.com",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: ["production"],
    dataEnv: "mainnet",
  },
  {
    name: "Helikon",
    url: "wss://rpc.helikon.io/hydradx",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: ["production"],
    dataEnv: "mainnet",
  },
  {
    name: "Dotters",
    url: "wss://hydration.dotters.network",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql",
    env: ["production"],
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
    name: "Paseo",
    url: `wss://${PASEO_WS_URL}`,
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql",
    env: ["rococo", "development"],
    dataEnv: "paseo",
  },
]
