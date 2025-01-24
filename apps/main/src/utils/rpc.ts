import { hexToU8a, u8aToBn } from "@polkadot/util"

import { wsToHttp } from "@/utils/formatting"

/**
 * Sends a ping request to the specified URL and measures the round-trip time.
 * @param url The URL to ping.
 * @param timeoutMs The maximum time to wait for a response, in milliseconds.
 */
export async function pingRpc(url: string, timeoutMs = 5000): Promise<number> {
  const start = performance.now()

  try {
    const end = await Promise.race([
      (async () => {
        await jsonRpcFetch(wsToHttp(url), "chain_getBlockHash")
        return performance.now()
      })(),
      new Promise<number>((resolve) => {
        setTimeout(() => {
          resolve(Infinity)
        }, timeoutMs)
      }),
    ])

    return end - start
  } catch (error) {
    return Infinity
  }
}

export type RpcInfoResult = {
  blockNumber: number | null
  timestamp: number | null
}

export async function fetchRpcInfo(url: string): Promise<RpcInfoResult> {
  const blockHash = await jsonRpcFetch(wsToHttp(url), "chain_getBlockHash")

  const [header, ts] = await Promise.all([
    jsonRpcFetch(wsToHttp(url), "chain_getHeader", [blockHash]),
    jsonRpcFetch(wsToHttp(url), "state_getStorage", [
      "0xf0c365c3cf59d671eb72da0e7a4113c49f1f0515f462cdcf84e0f1d6045dfcbb", // timestamp storage key
      blockHash,
    ]),
  ])

  return {
    timestamp: u8aToBn(hexToU8a(ts), { isLe: true }).toNumber(),
    blockNumber: parseInt(header.number, 16),
  }
}

async function jsonRpcFetch(
  url: string,
  method: string,
  params: string[] = [],
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method,
      params,
    }),
  })

  if (!res.ok) {
    throw new Error("Failed to fetch")
  }

  const json = await res.json()

  if (!json.result) {
    throw new Error("Failed to fetch")
  }

  return json.result
}
