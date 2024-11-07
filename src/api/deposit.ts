import { useQueries } from "@tanstack/react-query"
import { useState } from "react"
import { QUERY_KEYS } from "utils/queryKeys"

const RATE_LIMIT_ERROR_CODE = 429

type SubscanApiResponse<T = unknown> = {
  code: number
  message: string
  generated_at: number
  data: T
}

type SubscanMultichainAccount = {
  network: string
  symbol: string
  decimal: number
  price: string
  category: string
  balance: string
  locked: string
  reserved: string
  bonded: string
  unbonding: string
  democracy_lock: string
  conviction_lock: string
  election_lock: string
  nomination_bonded: string
  currency_id: string
  token_unique_id: string
}

type RateLimitInfo = {
  limit: number
  remaining: number
  reset: number
}

class RateLimitError extends Error {
  status: number
  retryAfter: number | null

  constructor(retryAfter: number | null) {
    super(
      `Rate limit exceeded. Retry after ${retryAfter ? retryAfter + " seconds" : "some time"}.`,
    )
    this.name = "RateLimitError"
    this.status = 429
    this.retryAfter = retryAfter
  }
}

const getMultichainBalances = async (address: string) => {
  const res = await fetch(
    "https://polkadot.api.subscan.io/api/scan/multiChain/account",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
      }),
      redirect: "follow",
    },
  )

  if (res.status === RATE_LIMIT_ERROR_CODE) {
    const retryAfterHeader = res.headers.get("retry-after")
    const retryAfterSeconds = retryAfterHeader
      ? parseInt(retryAfterHeader, 10)
      : null
    throw new RateLimitError(retryAfterSeconds)
  }

  if (!res.ok) {
    throw new Error("Subscan API request failed")
  }

  // Parse the rate limit headers
  const rateLimit = {
    limit: Number(res.headers.get("ratelimit-limit")),
    remaining: Number(res.headers.get("ratelimit-remaining")),
    reset: Number(res.headers.get("ratelimit-reset")),
  }

  const json = (await res.json()) as SubscanApiResponse<
    SubscanMultichainAccount[]
  >
  return { json, rateLimit }
}

export const useMultichainBalances = (addresses: string[]) => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)

  return useQueries({
    queries: addresses.map((address) => ({
      queryKey: QUERY_KEYS.multichainBalances(address),
      queryFn: async () => {
        const { json, rateLimit } = await getMultichainBalances(address)
        setRateLimitInfo(rateLimit)
        return json?.data ?? []
      },
      retry: (failureCount: number, error: RateLimitError) => {
        if (error.status === RATE_LIMIT_ERROR_CODE) {
          // keep retrying when rate limit is exceeded
          return true
        }
        return failureCount < 3
      },
      retryDelay: (failureCount: number) => {
        if (rateLimitInfo?.remaining === 0) {
          return rateLimitInfo.reset * 1000
        }

        return Math.min(1000 * 2 ** failureCount, 30000)
      },
      refetchOnWindowFocus: false,
    })),
  })
}
