import { useOmnipoolDataObserver } from "api/omnipool"
import BN from "bignumber.js"
import { useMemo } from "react"
import { HYDRA_TREASURE_ACCOUNT } from "utils/api"
import { scaleHuman } from "utils/balance"
import { BN_0, BN_NAN } from "utils/constants"
import { useNewDisplayPrices } from "utils/displayAsset"
import { useFee, useTreasuryBalances, useTVL } from "api/stats"
import { useOmnipoolVolumes } from "api/volume"
import { useLiquidityPositionData } from "utils/omnipool"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"
import { useOmnipoolFarms } from "api/farms"
import { useAssetsData } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"

const withoutRefresh = true

export type TTreasuryAsset = {
  value: string
  valueDisplay: string
  id: string
  symbol: string
  iconIds: string[] | string
  name: string
}

export const useTreasuryAssets = () => {
  const { native, getAssetWithFallback } = useAssets()
  const { data: treasuryBalances } = useTreasuryBalances()

  const { data: accountAssets, isLoading: isAccountsAssetsLoading } =
    useAccountAssets(HYDRA_TREASURE_ACCOUNT)

  const { data: treasutyAssets, isLoading: isAssetsDataLoading } =
    useAssetsData({
      address: HYDRA_TREASURE_ACCOUNT,
    })
  const { data: omnipoolAssets, isLoading: isOmnipoolAssetsLoading } =
    useOmnipoolAssetDetails()
  const { data: positions, isLoading: isPositionsLoading } =
    useOmnipoolPositionsData({
      address: HYDRA_TREASURE_ACCOUNT,
    })
  const { getData } = useLiquidityPositionData()

  const bonds = Array.from(accountAssets?.accountBondsMap.values() ?? [])

  const { data: spotPrices, isLoading: isSpotPriceLoading } =
    useNewDisplayPrices([
      ...bonds.map((bond) => bond.asset.id),
      treasuryBalances?.id ?? "0",
    ])

  const isLoading =
    isAccountsAssetsLoading ||
    isAssetsDataLoading ||
    isOmnipoolAssetsLoading ||
    isPositionsLoading ||
    isSpotPriceLoading

  const bondAssets: TTreasuryAsset[] | undefined = useMemo(() => {
    if (spotPrices && bonds) {
      return bonds.map((bond) => {
        const spotPrice =
          spotPrices.find((spotPrice) => spotPrice?.tokenIn === bond.asset.id)
            ?.spotPrice ?? BN_NAN

        const value = scaleHuman(bond.balance.total, bond.asset.decimals)

        return {
          value: value.toString(),
          valueDisplay: value.times(spotPrice).toString(),
          id: bond.asset.id,
          symbol: bond.asset.symbol,
          iconIds: bond.asset.iconId,
          name: bond.asset.name,
        }
      })
    }
  }, [bonds, spotPrices])

  const combinedAssets = useMemo(() => {
    if (treasutyAssets && omnipoolAssets && treasuryBalances) {
      const map: Map<string, TTreasuryAsset> = new Map()

      treasutyAssets.forEach((asset) => {
        if (asset.totalDisplay && BN(asset.totalDisplay).gt(50)) {
          map.set(asset.id, {
            value: asset.total,
            valueDisplay: asset.totalDisplay,
            id: asset.id,
            symbol: asset.symbol,
            iconIds: asset.meta.iconId,
            name: asset.meta.name,
          })
        }
      })

      omnipoolAssets.forEach((asset) => {
        const mapValue = map.get(asset.id)
        if (asset.polDisplay.gt(50)) {
          if (mapValue) {
            map.set(asset.id, {
              ...mapValue,
              value: BN(mapValue.value).plus(asset.pol).toString(),
              valueDisplay: BN(mapValue.valueDisplay)
                .plus(asset.polDisplay)
                .toString(),
            })
          } else {
            map.set(asset.id, {
              value: asset.pol.toString(),
              valueDisplay: asset.polDisplay.toString(),
              id: asset.id,
              symbol: asset.symbol,
              iconIds: asset.iconIds,
              name: asset.name,
            })
          }
        }
      })

      const treasuryAsset = map.get(treasuryBalances.id)
      const treasuryMeta = getAssetWithFallback(treasuryBalances.id)
      const treasurySpotPrice = spotPrices?.find(
        (spotPrice) => spotPrice?.tokenIn === treasuryBalances.id,
      )?.spotPrice
      const value = BN(treasuryBalances.balance).shiftedBy(
        -treasuryMeta.decimals,
      )
      const valueDisplay = value.times(treasurySpotPrice ?? BN_NAN).toString()

      map.set(
        treasuryBalances.id,
        treasuryAsset
          ? {
              ...treasuryAsset,
              value: BN(treasuryAsset.value).plus(value).toString(),
              valueDisplay: BN(treasuryAsset.valueDisplay)
                .plus(valueDisplay)
                .toString(),
            }
          : {
              id: treasuryMeta.id,
              symbol: treasuryMeta.symbol,
              iconIds: treasuryMeta.iconId,
              value: value.toString(),
              valueDisplay,
              name: treasuryMeta.name,
            },
      )

      return Array.from(map.values()).sort((assetA, assetB) => {
        if (assetA.id === native.id) {
          return -1
        }

        if (assetB.id === native.id) {
          return 1
        }

        return BN(assetA.valueDisplay).gt(assetB.valueDisplay) ? -1 : 1
      })
    }
  }, [
    treasutyAssets,
    omnipoolAssets,
    native.id,
    getAssetWithFallback,
    spotPrices,
    treasuryBalances,
  ])

  const liquidityPositions = useMemo(() => {
    return Array.from(
      positions
        .reduce<Map<string, TTreasuryAsset>>((acc, position) => {
          const data = getData(position)

          if (data) {
            const assetId = position.assetId

            const mapValue = acc.get(assetId)

            if (mapValue) {
              acc.set(assetId, {
                ...mapValue,
                value: BN(mapValue.value).plus(data.valueShifted).toString(),
                valueDisplay: BN(mapValue.valueDisplay)
                  .plus(data.valueDisplay)
                  .toString(),
              })
            } else {
              acc.set(assetId, {
                id: assetId,
                symbol: position.symbol,
                iconIds: position.meta.iconId,
                value: data.valueShifted.toString(),
                valueDisplay: data.valueDisplay.toString(),
                name: position.name,
              })
            }
          }

          return acc
        }, new Map([]))
        .values(),
    )
  }, [getData, positions])

  const assetsTotalDisplay = useMemo(() => {
    return combinedAssets?.reduce(
      (acc, asset) => BN(acc).plus(asset.valueDisplay).toString(),
      "0",
    )
  }, [combinedAssets])

  const liquidityPositionsTotalDisplay = useMemo(() => {
    return liquidityPositions.reduce(
      (acc, asset) => BN(acc).plus(asset.valueDisplay).toString(),
      "0",
    )
  }, [liquidityPositions])

  const bondsTotalDisplay = useMemo(() => {
    return bondAssets?.reduce(
      (acc, asset) => BN(acc).plus(asset.valueDisplay).toString(),
      "0",
    )
  }, [bondAssets])

  const total = useMemo(() => {
    if (
      assetsTotalDisplay &&
      liquidityPositionsTotalDisplay &&
      bondsTotalDisplay
    ) {
      return BN(assetsTotalDisplay)
        .plus(liquidityPositionsTotalDisplay)
        .plus(bondsTotalDisplay)
        .toString()
    }
  }, [assetsTotalDisplay, liquidityPositionsTotalDisplay, bondsTotalDisplay])

  const { totalTvl, totalVolume, POLMultiplier } = useMemo(() => {
    const { totalTvl, totalPol, totalVolume } = omnipoolAssets.reduce(
      (acc, omnipoolAsset) => {
        acc = {
          totalTvl: acc.totalTvl.plus(
            omnipoolAsset.tvl.isNaN() ? 0 : omnipoolAsset.tvl,
          ),
          totalPol: acc.totalPol.plus(omnipoolAsset.polDisplay),
          totalVolume: acc.totalVolume.plus(
            omnipoolAsset.volume.isNaN() ? 0 : omnipoolAsset.volume,
          ),
        }
        return acc
      },
      { totalTvl: BN_0, totalPol: BN_0, totalVolume: BN_0 },
    )

    const POLMultiplier = totalPol
      .plus(liquidityPositionsTotalDisplay)
      .div(totalTvl)
      .toFixed(4)

    return {
      POLMultiplier,
      totalVolume: totalVolume.toString(),
      totalTvl: totalTvl.toString(),
    }
  }, [omnipoolAssets, liquidityPositionsTotalDisplay])

  return {
    bondAssets,
    assets: combinedAssets,
    liquidityPositions,
    assetsTotalDisplay,
    liquidityPositionsTotalDisplay,
    bondsTotalDisplay,
    total,
    isLoading,
    totalTvl,
    totalVolume,
    POLMultiplier,
  }
}

export const useOmnipoolAssetDetails = () => {
  const { native, getAssetWithFallback } = useAssets()
  const omnipoolAssets = useOmnipoolDataObserver()

  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []
  const { data: allFarms, isLoading: isAllFarmsLoading } =
    useOmnipoolFarms(omnipoolAssetsIds)

  const { data: volumes = [], isLoading: isVolumeLoading } =
    useOmnipoolVolumes(omnipoolAssetsIds)

  const { data: tvls, isLoading: isTvlsLoading } = useTVL("all")
  const { data: fees, isLoading: isFeesLoading } = useFee("all")

  const { data: spotPrices, isLoading: isSpotPricesLoading } =
    useNewDisplayPrices(omnipoolAssetsIds, withoutRefresh)

  const isLoading =
    omnipoolAssets.isLoading || isSpotPricesLoading || isTvlsLoading

  const data = useMemo(() => {
    if (!omnipoolAssets.data || !tvls || !spotPrices) return []

    const rows = omnipoolAssets.data.map((omnipoolAsset) => {
      const omnipoolAssetId = omnipoolAsset.id
      const shares = omnipoolAsset.shares
      const protocolShares = BN(omnipoolAsset.protocolShares)

      const meta = getAssetWithFallback(omnipoolAsset.id)

      const spotPrice =
        spotPrices.find((sp) => sp?.tokenIn === omnipoolAssetId)?.spotPrice ??
        ""

      const omnipoolAssetCap = scaleHuman(omnipoolAsset.cap, "q")

      const free = omnipoolAsset.balance

      const valueOfShares = protocolShares
        .div(shares)
        .multipliedBy(free)
        .shiftedBy(-meta.decimals)

      const pol = valueOfShares

      const polDisplay = pol.times(spotPrice)

      const tvl = BN(
        tvls?.find((tvl) => tvl?.asset_id === Number(omnipoolAssetId))
          ?.tvl_usd ?? BN_NAN,
      )

      const volumeRaw = volumes?.find(
        (volume) => volume.assetId === meta.id,
      )?.assetVolume

      const volume =
        volumeRaw && spotPrice
          ? BN(volumeRaw).shiftedBy(-meta.decimals).multipliedBy(spotPrice)
          : BN_NAN
      const isLoadingFee = isFeesLoading || isAllFarmsLoading

      const { totalApr, farms = [] } = allFarms?.get(omnipoolAsset.id) ?? {}

      const fee =
        native.id === omnipoolAssetId
          ? BN_0
          : BN(
              fees?.find((fee) => fee?.asset_id === Number(omnipoolAssetId))
                ?.projected_apr_perc ?? BN_NAN,
            )

      const totalFee = !isLoadingFee ? fee.plus(totalApr ?? 0) : BN_NAN

      return {
        id: omnipoolAssetId,
        name: meta.name,
        symbol: meta.symbol,
        tvl,
        volume,
        pol,
        polDisplay,
        iconIds: meta.iconId,
        cap: omnipoolAssetCap,
        price: spotPrice,
        fee,
        totalFee,
        farms,
        isLoadingFee,
        isLoadingVolume: isVolumeLoading,
      }
    })
    return rows
  }, [
    fees,
    isFeesLoading,
    getAssetWithFallback,
    native.id,
    omnipoolAssets.data,
    spotPrices,
    tvls,
    volumes,
    isVolumeLoading,
    allFarms,
    isAllFarmsLoading,
  ]).sort((assetA, assetB) => {
    if (assetA.id === native.id) {
      return -1
    }

    if (assetB.id === native.id) {
      return 1
    }

    if (assetA["tvl"].isNaN()) return 1
    if (assetB["tvl"].isNaN()) return -1

    return assetA["tvl"].gt(assetB["tvl"]) ? -1 : 1
  })

  return { data, isLoading }
}

export type TUseOmnipoolAssetDetailsData = ReturnType<
  typeof useOmnipoolAssetDetails
>["data"]
