import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { Maybe } from "graphql/jsutils/Maybe"
import { useRpcProvider } from "providers/rpcProvider"
import { ChartType } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import BigNumber from "bignumber.js"
import { millisecondsInMinute } from "date-fns"
import { BN_0 } from "utils/constants"
import { useExternalApi } from "./external"

export type StatsData = {
  timestamp: string
  volume_usd: number
  tvl_usd: number
  tvl_pol_usd: number
  volume_roll_24_usd: number
}

export enum StatsTimeframe {
  DAILY = "daily",
  HOURLY = "hourly",
}

export const useStats = (
  data: Maybe<{
    timeframe?: StatsTimeframe
    assetId?: string
    type: ChartType
  }>,
) => {
  const { timeframe, assetId, type = "tvl" } = data ?? {}
  return useQuery(
    QUERY_KEYS.stats(type, timeframe, assetId),
    async () => {
      const res =
        type === "volume"
          ? await getStats(timeframe, assetId)()
          : await getStatsTvl(assetId)()

      if (!res.length) {
        throw new Error("Error fetching stats data")
      }

      return res
    },
    { retry: 0 },
  )
}

const getStats = (timeframe?: StatsTimeframe, assetId?: string) => async () => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/charts/volume${
      assetId != null ? `/${assetId}` : ""
    }${timeframe ? `?timeframe=${timeframe}` : ""}`,
  )

  const data: Promise<StatsData[]> = res.json()

  return data
}

const getStatsTvl = (assetId?: string) => async () => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/charts/tvl${
      assetId != null ? `/${assetId}` : ""
    }`,
  )

  const data: Promise<StatsData[]> = res.json()

  return data
}

export const useTVL = (assetId?: string) => {
  return useQuery(
    QUERY_KEYS.tvl(assetId),
    assetId
      ? async () => {
          const data = await getTVL(assetId === "all" ? undefined : assetId)
          return data
        }
      : undefinedNoop,
    { enabled: !!assetId },
  )
}

const getTVL = async (assetId?: string) => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v2/stats/tvl${
      assetId != null ? `/${assetId}` : ""
    }`,
  )
  const data: Promise<{ tvl_usd: number; asset_id: number }[]> = res.json()

  return data
}

export const useFee = (assetId?: string | "all") => {
  return useQuery(
    QUERY_KEYS.fee(assetId),
    assetId
      ? async () => {
          const asset_id = assetId === "all" ? undefined : assetId
          const data = await geFee(asset_id)

          return data
        }
      : undefinedNoop,
    {
      enabled: !!assetId,
    },
  )
}

const geFee = async (assetId?: string) => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v2/stats/fees${
      assetId !== undefined ? `/${assetId}` : ""
    }`,
  )
  const data: Promise<
    {
      asset_id: number
      accrued_fees_usd: number
      projected_apy_perc: number
      projected_apr_perc: number
    }[]
  > = res.json()

  return data
}

export const useAccountsIdentity = (addresses: string[]) => {
  const { api } = useRpcProvider()

  return useQueries({
    queries: addresses.map((address) => ({
      queryKey: QUERY_KEYS.identity(address),
      queryFn:
        address != null ? getAccountIdentity(api, address) : undefinedNoop,
      enabled: !!address,
    })),
  })
}

export const useAccountIdentity = (address?: string) => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.identity(address),
    address ? getAccountIdentity(api, address) : undefinedNoop,
    { enabled: !!address },
  )
}

const getAccountIdentity = (api: ApiPromise, address: string) => async () => {
  const res = await api.query.identity.identityOf(address)

  return {
    address,
    identity: res.isSome ? res.unwrap()[0].info.display.asRaw.toUtf8() : null,
  }
}

export const useTreasuryBalances = () => {
  const { data: api } = useExternalApi("polkadot")

  return useQuery(
    QUERY_KEYS.treasuryBalances,
    api
      ? async () => {
          const balances = await Promise.all([
            api.query.system.account(
              "13RSNAx31mcP5H5KYf12cP5YChq6JeD8Hi64twhhxKtHqBkg",
            ),
            api.query.system.account(
              "14kovW62mmGZBRvbNT1w5J7m9SQskd5JTRTLKZLpkpjmZBJ8",
            ),
          ])

          const totalBalances = balances.reduce((acc, balance) => {
            const { free, reserved } = balance.data

            const total = BigNumber(free.toString())
              .plus(reserved.toString())
              .toString()

            return acc.plus(total)
          }, BN_0)

          return { balance: totalBalances.toString(), id: "5" }
        }
      : undefinedNoop,
    { staleTime: millisecondsInMinute, enabled: !!api },
  )
}
