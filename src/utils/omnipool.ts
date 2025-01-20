import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useOmnipoolDataObserver } from "api/omnipool"
import BN from "bignumber.js"
import { BN_NAN } from "utils/constants"
import { useNewDisplayPrice, useNewDisplayPrices } from "./displayAsset"
import { scale } from "./balance"
import { useCallback } from "react"
import { useAssets } from "providers/assets"
import { TOmnipoolPosition } from "api/deposits"

type IOptions = {
  sharesValue?: string
  fee?: string
}

export type TLPData = NonNullable<
  ReturnType<ReturnType<typeof useLiquidityPositionData>["getData"]>
>

export const useLiquidityPositionData = (assetsId?: string[]) => {
  const { hub, getAssetWithFallback } = useAssets()

  const omnipoolAssets = useOmnipoolDataObserver()
  const omnipoolAssetIds = omnipoolAssets.data?.map((asset) => asset.id) ?? []

  const hubSp = useNewDisplayPrice(hub.id)
  const spotPrices = useNewDisplayPrices(assetsId ?? omnipoolAssetIds)

  const getData = useCallback(
    (position: TOmnipoolPosition, options?: IOptions) => {
      const omnipoolAsset = omnipoolAssets.dataMap?.get(position.assetId)

      if (!omnipoolAsset) return undefined

      const spotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === omnipoolAsset.id,
      )?.spotPrice

      const meta = getAssetWithFallback(omnipoolAsset.id)

      if (!spotPrice || !hubSp.data?.spotPrice || !meta) return undefined

      const [nom, denom] = position.price.map((n) => new BN(n.toString()))
      const price = nom.div(denom)

      const shares = position.shares

      const positionPrice = scale(price, "q")

      let lernaOutResult = "-1"
      let liquidityOutResult = "-1"

      const params: Parameters<typeof calculate_liquidity_out> = [
        omnipoolAsset.balance.toString(),
        omnipoolAsset.hubReserve,
        omnipoolAsset.shares,
        position.amount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        options?.sharesValue ?? position.shares.toString(),
        options?.fee ?? "0",
      ]

      lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
      liquidityOutResult = calculate_liquidity_out.apply(this, params)

      const lrna = lernaOutResult !== "-1" ? new BN(lernaOutResult) : BN_NAN
      const lrnaShifted = lrna.shiftedBy(-hub.decimals)

      const value =
        liquidityOutResult !== "-1" ? new BN(liquidityOutResult) : BN_NAN
      const valueShifted = value.shiftedBy(-meta.decimals)

      let valueDisplay = BN_NAN
      let valueDisplayWithoutLrna = BN_NAN
      let lrnaDisplay = BN_NAN
      let totalValue = value
      let totalValueShifted = valueShifted

      const amount = position.amount
      const amountShifted = BN(amount).shiftedBy(-meta.decimals)
      const amountDisplay = amountShifted.times(spotPrice)

      if (liquidityOutResult !== "-1") {
        valueDisplay = valueShifted.times(spotPrice)

        valueDisplayWithoutLrna = valueDisplay

        if (lrnaShifted.gt(0)) {
          lrnaDisplay = lrnaShifted.times(hubSp.data.spotPrice)
          valueDisplay = valueDisplay.plus(lrnaDisplay)

          totalValueShifted = valueDisplay.div(spotPrice)
          totalValue = scale(valueDisplay.div(spotPrice), meta.decimals)
        }
      }

      return {
        id: position.id,
        symbol: meta.symbol,
        name: meta.name,
        assetId: position.assetId,
        lrna,
        lrnaShifted,
        lrnaDisplay,
        value,
        valueShifted,
        valueDisplay,
        valueDisplayWithoutLrna,
        price: position.price,
        amount,
        amountDisplay,
        amountShifted,
        shares,
        totalValue,
        totalValueShifted,
        meta,
      }
    },
    [
      getAssetWithFallback,
      hub.decimals,
      hubSp.data?.spotPrice,
      omnipoolAssets.dataMap,
      spotPrices.data,
    ],
  )

  return { getData }
}
