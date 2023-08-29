// @ts-nocheck
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"

export type Bond = {
  assetId: string
  id: string
  name: string
  maturity: number
}

export const useBonds = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.bonds, async () => {
    const raw = await api.query.assetRegistry.assets.entries()

    return raw.reduce<Promise<Bond[]>>(async (acc, [key, dataRaw]) => {
      const prevAcc = await acc
      const data = dataRaw.unwrap()

      if (data.assetType.isBond) {
        const id = key.args[0].toString()

        const detailsRaw = await api.query.bonds.bonds(id)
        const details = detailsRaw.unwrap()

        const [assetId, maturity] = details ?? []

        prevAcc.push({
          id,
          name: data.name.toString(),
          assetId: assetId?.toString(),
          maturity: maturity?.toNumber(),
        })
      }

      return prevAcc
    }, Promise.resolve([]))
  })
}
