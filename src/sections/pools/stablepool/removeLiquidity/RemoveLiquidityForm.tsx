import { default as BigNumber } from "bignumber.js"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { getFloatingPointAmount } from "utils/balance"
import {
  BN_100,
  SLIPPAGE_LIMIT,
  STABLEPOOL_TOKEN_DECIMALS,
} from "utils/constants"
import { theme } from "theme"
import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { useStablepoolLiquidityOut } from "./RemoveLiquidity.utils"
import { RemoveLiquidityReward } from "sections/pools/modals/RemoveLiquidity/components/RemoveLiquidityReward"
import { STradingPairContainer } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity.styled"
import { RemoveLiquidityInput } from "sections/pools/modals/RemoveLiquidity/components/RemoveLiquidityInput"
import { useRpcProvider } from "providers/rpcProvider"
import { useAssets } from "providers/assets"
import { createToastMessages } from "state/toasts"
import { scaleHuman } from "utils/balance"
import { Switch } from "components/Switch/Switch"

type RemoveLiquidityProps = {
  assetId: string
  onClose: () => void
  position: {
    reserves: { asset_id: number; amount: string }[]
    poolId: string
    amount: BigNumber
    fee: BigNumber
  }
  onSuccess: () => void
  onAssetOpen: () => void
  defaultValue?: number
  splitRemove: boolean
  setSplitRemove: (enabled: boolean) => void
}

export const RemoveStablepoolLiquidityForm = ({
  assetId,
  onClose,
  onSuccess,
  position,
  onAssetOpen,
  defaultValue,
  splitRemove,
  setSplitRemove,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({
    defaultValues: { value: defaultValue ?? 25 },
  })
  const { api } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { createTransaction } = useStore()

  const value = form.watch("value")

  const removeSharesValue = useMemo(() => {
    return position.amount.div(100).times(value).dp(0).toString()
  }, [value, position])

  const { getAssetOutValue } = useStablepoolLiquidityOut({
    reserves: position.reserves,
    poolId: position.poolId,
    fee: position.fee.toString(),
  })

  const feeDisplay = useMemo(
    () => position.fee.times(BN_100).toString(),
    [position.fee],
  )

  const minAssetsOut = useMemo(() => {
    const reservesAmount = position.reserves.length

    if (splitRemove) {
      return position.reserves.map((reserve) => {
        const meta = getAssetWithFallback(reserve.asset_id.toString())
        const assetOutValue = getAssetOutValue(
          reserve.asset_id,
          BigNumber(removeSharesValue).div(reservesAmount).toFixed(0),
        )

        const minValue = "0"

        return {
          minValue,
          assetOutValue,
          meta,
        }
      })
    }

    const meta = getAssetWithFallback(assetId)
    const assetOutValue = getAssetOutValue(Number(assetId), removeSharesValue)
    const minValue = BigNumber(assetOutValue)
      .minus(SLIPPAGE_LIMIT.plus(feeDisplay).times(assetOutValue).div(100))
      .dp(0)
      .toString()

    return [{ minValue, assetOutValue, meta }]
  }, [
    assetId,
    getAssetOutValue,
    getAssetWithFallback,
    position,
    removeSharesValue,
    feeDisplay,
    splitRemove,
  ])

  const handleSubmit = async () => {
    await createTransaction(
      {
        tx: splitRemove
          ? api.tx.stableswap.removeLiquidity(
              position.poolId,
              removeSharesValue,
              minAssetsOut.map((minAssetOut) => ({
                assetId: minAssetOut.meta.id,
                amount: minAssetOut.minValue,
              })),
            )
          : api.tx.stableswap.removeLiquidityOneAsset(
              position.poolId,
              assetId,
              removeSharesValue,
              minAssetsOut[0].minValue,
            ),
      },
      {
        onSuccess,
        onClose,
        onBack: () => {},
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        toast: createToastMessages("liquidity.stablepool.remove", {
          t,
          tOptions: {
            out: scaleHuman(removeSharesValue, STABLEPOOL_TOKEN_DECIMALS)
              .dp(4)
              .toString(),
            symbol: asset?.symbol,
          },
          components: ["span", "span.highlight"],
        }),
      },
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div>
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mx: -24,
            mb: 16,
            px: 24,
            py: 8,
          }}
          css={{
            borderTop: "1px solid #1C2038",
            borderBottom: "1px solid #1C2038",
          }}
        >
          <Text fs={14} color="brightBlue300">
            {t("liquidity.remove.modal.split")}
          </Text>
          <Switch
            value={splitRemove}
            onCheckedChange={setSplitRemove}
            label={t("yes")}
            name={t("liquidity.remove.modal.split")}
          />
        </div>

        <div sx={{ flex: "row", justify: "space-between" }}>
          <div>
            <Text
              fs={13}
              lh={13}
              sx={{ mb: 15 }}
              css={{
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                color: `rgba(${theme.rgbColors.whiteish500}, 0.6)`,
              }}
            >
              {t("selectAsset.title")}
            </Text>
            <AssetSelectButton
              assetId={assetId}
              onClick={onAssetOpen}
              disabled={splitRemove}
            />
          </div>
          <div>
            <Text fs={32} sx={{ mt: 24 }}>
              {t("liquidity.remove.modal.value", {
                value: getFloatingPointAmount(
                  removeSharesValue,
                  STABLEPOOL_TOKEN_DECIMALS,
                ),
              })}
            </Text>
            <Text fs={18} color="pink500" sx={{ mb: 20 }} tAlign="right">
              {t("value.percentage", { value })}
            </Text>
          </div>
        </div>
        <Controller
          name="value"
          control={form.control}
          render={({ field }) => (
            <RemoveLiquidityInput
              value={field.value}
              onChange={field.onChange}
              balance={t("value.token", {
                value: getFloatingPointAmount(
                  position.amount,
                  STABLEPOOL_TOKEN_DECIMALS,
                ),
              })}
            />
          )}
        />

        <STradingPairContainer>
          <Text color="brightBlue300">
            {t("liquidity.remove.modal.receive")}
          </Text>
          {minAssetsOut.map(({ assetOutValue, meta }) => (
            <RemoveLiquidityReward
              key={meta.id}
              id={meta.id}
              name={meta.symbol}
              symbol={meta.symbol}
              amount={t("value", {
                value: BigNumber(assetOutValue),
                fixedPointScale: meta.decimals,
                numberSuffix: ` ${meta.symbol}`,
                numberPrefix: splitRemove ? "~" : "",
              })}
            />
          ))}
        </STradingPairContainer>
      </div>
      <Spacer size={17} />
      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text color="basic400">
          {t("liquidity.remove.modal.tokenFee.label")}
        </Text>
        <Text color="white">
          {t("value.percentage", { value: feeDisplay })}
        </Text>
      </div>
      <Spacer size={20} />
      <Button fullWidth variant="primary" disabled={removeSharesValue === "0"}>
        {t("liquidity.stablepool.remove.confirm")}
      </Button>
    </form>
  )
}
