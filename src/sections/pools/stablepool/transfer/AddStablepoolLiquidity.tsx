import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccountStore, useStore } from "state/store"
import { FormValues } from "utils/helpers"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import { useStablepoolShares } from "./AddStablepoolLiquidity.utils"
import { u32 } from "@polkadot/types-codec"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { useTokenBalance } from "api/balances"
import { positive, validNumber } from "utils/validators"
import { ISubmittableResult } from "@polkadot/types/types"
import { TAsset } from "api/assetDetails"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  poolId: u32
  fee: BigNumber
  asset: TAsset
  onSuccess: (result: ISubmittableResult) => void
  onClose: () => void
  onCancel: () => void
  onAssetOpen: () => void
  onSubmitted: (shares?: string) => void
  reserves: { asset_id: number; amount: string }[]
}

export const AddStablepoolLiquidity = ({
  poolId,
  asset,
  onSuccess,
  onAssetOpen,
  onSubmitted,
  onClose,
  onCancel,
  reserves,
  fee,
}: Props) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const form = useForm<{ amount: string }>({ mode: "onChange" })
  const displayPrice = useDisplayPrice(asset.id)

  const amountIn = form.watch("amount")

  const { shares, assets } = useStablepoolShares({
    poolId,
    asset: { id: asset.id, decimals: asset.decimals, amount: amountIn },
    reserves,
  })

  const { account } = useAccountStore()
  const walletBalance = useTokenBalance(asset.id, account?.address)

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (asset.decimals == null) {
      throw new Error("Missing asset meta")
    }

    return await createTransaction(
      { tx: api.tx.stableswap.addLiquidity(poolId, assets) },
      {
        onSuccess,
        onSubmitted: () => {
          onSubmitted(shares)
          form.reset()
        },
        onClose,
        onBack: () => {},
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: asset.symbol,
                shares,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onSuccess"
              tOptions={{
                value: values.amount,
                symbol: asset.symbol,
                shares,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onError: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: asset.symbol,
                shares,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div sx={{ flex: "column" }}>
        <Controller
          name="amount"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.required"),
            validate: {
              validNumber,
              positive,
              maxBalance: (value) => {
                try {
                  if (asset.decimals == null) {
                    throw new Error("Missing asset meta")
                  }

                  if (
                    walletBalance.data?.balance?.gte(
                      BigNumber(value).shiftedBy(asset.decimals),
                    )
                  ) {
                    return true
                  }
                } catch {}
                return t("liquidity.add.modal.validation.notEnoughBalance")
              },
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onChange={onChange}
              asset={asset.id}
              error={error?.message}
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <SummaryRow
          label={t("liquidity.add.modal.tradeFee")}
          content={t("value.percentage", { value: fee.multipliedBy(100) })}
          description={t("liquidity.add.modal.tradeFee.description")}
        />
        <Spacer size={20} />
        <Text color="pink500" fs={15} font="FontOver" tTransform="uppercase">
          {t("liquidity.add.modal.positionDetails")}
        </Text>
        <Summary
          rows={[
            {
              label: t("liquidity.add.modal.shareTokens"),
              content: t("value", {
                value: shares,
                type: "token",
              }),
            },
            {
              label: t("liquidity.remove.modal.price"),
              content: (
                <Text fs={14} color="white" tAlign="right">
                  <Trans
                    t={t}
                    i18nKey="liquidity.add.modal.row.spotPrice"
                    tOptions={{
                      firstAmount: 1,
                      firstCurrency: asset.symbol,
                    }}
                  >
                    <DisplayValue value={displayPrice.data?.spotPrice} />
                  </Trans>
                </Text>
              ),
            },
          ]}
        />
        <PoolAddLiquidityInformationCard />
        <Spacer size={20} />
      </div>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          gap: "100px",
          mb: [24, 0],
        }}
      >
        <Button variant="secondary" type="button" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          sx={{ width: "300px" }}
          variant="primary"
          type="submit"
          disabled={!form.formState.isValid}
        >
          {t("confirm")}
        </Button>
      </div>
    </form>
  )
}
