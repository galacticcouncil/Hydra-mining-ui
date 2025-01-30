import { useAccountCurrency } from "api/payments"
import { useSpotPrice } from "api/spotPrice"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import BigNumber from "bignumber.js"
import { Alert } from "components/Alert/Alert"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { theme } from "theme"
import {
  BN_0,
  BN_1,
  BN_10,
  UNIFIED_ADDRESS_FORMAT_ENABLED,
} from "utils/constants"
import {
  getAddressVariants,
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"
import { FormValues } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import {
  CloseIcon,
  PasteAddressIcon,
} from "./WalletTransferSectionOnchain.styled"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { H160, safeConvertAddressH160 } from "utils/evm"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { usePaymentFees } from "./WalletTransferSectionOnchain.utils"
import { useInsufficientFee } from "api/consts"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useAccountAssets, useRefetchAccountAssets } from "api/deposits"
import { createToastMessages } from "state/toasts"
import { Switch } from "components/Switch/Switch"
import { useState } from "react"

export function WalletTransferSectionOnchain({
  asset,
  form,
  onClose,
  openAssets,
  openAddressBook,
  staticAsset,
}: {
  asset: string
  form: UseFormReturn<{ dest: string; amount: string }>
  onClose: () => void
  openAssets?: () => void
  openAddressBook: () => void
  staticAsset: boolean
}) {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { native, getAssetWithFallback } = useAssets()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const accountAssets = useAccountAssets()
  const refetchAccountAssets = useRefetchAccountAssets()

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const tokenBalance = accountAssets.data?.accountAssetsMap.get(asset)?.balance
  const assetMeta = getAssetWithFallback(asset.toString())

  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = accountCurrency.data
    ? getAssetWithFallback(accountCurrency.data)
    : undefined

  const spotPrice = useSpotPrice(native.id, accountCurrencyMeta?.id)

  const isTransferingPaymentAsset = accountCurrency.data === asset.toString()

  const balance = BigNumber(tokenBalance?.balance ?? "0")

  const [debouncedAmount] = useDebouncedValue(form.watch("amount"), 500)

  const amount = new BigNumber(debouncedAmount)
    .multipliedBy(BN_10.pow(assetMeta.decimals))
    .decimalPlaces(0)

  const { currentFee, maxFee } = usePaymentFees({
    asset,
    currentAmount: amount,
    maxAmount: balance,
  })

  const insufficientFee = useInsufficientFee(asset, form.watch("dest"))

  const nativeDecimals = native.decimals
  const nativeDecimalsDiff =
    nativeDecimals - (accountCurrencyMeta?.decimals ?? nativeDecimals)

  const convertedFee = currentFee.multipliedBy(
    spotPrice.data?.spotPrice ?? BN_1,
  )

  const convertedMaxFee = maxFee.multipliedBy(spotPrice.data?.spotPrice ?? BN_1)

  const balanceMaxAdjusted = balance
    .minus(convertedMaxFee.div(BN_10.pow(nativeDecimalsDiff)))
    .decimalPlaces(0)

  const balanceMax = isTransferingPaymentAsset
    ? BigNumber.max(BN_0, balanceMaxAdjusted)
    : balance

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.decimals == null) throw new Error("Missing asset meta")

    const amount = new BigNumber(values.amount)
      .multipliedBy(BN_10.pow(assetMeta.decimals))
      .decimalPlaces(0)

    const normalizedDest =
      safeConvertAddressH160(values.dest) !== null
        ? new H160(values.dest).toAccount()
        : values.dest

    return await createTransaction(
      {
        tx:
          asset.toString() === native.id || assetMeta.isErc20
            ? api.tx.currencies.transfer(
                normalizedDest,
                asset.toString(),
                amount.toFixed(),
              )
            : api.tx.tokens.transfer(normalizedDest, asset, amount.toFixed()),
        overrides: insufficientFee
          ? {
              fee: currentFee,
              feeExtra: insufficientFee.value,
              currencyId: accountCurrencyMeta?.id,
            }
          : undefined,
      },
      {
        onClose,
        disableAutoClose: true,
        onSubmitted: onClose,
        onBack: () => {},
        onSuccess: () => refetchAccountAssets(),
        toast: createToastMessages("wallet.assets.transfer.toast", {
          t,
          tOptions: {
            value: values.amount,
            symbol: assetMeta.symbol,
            address: shortenAccountAddress(
              getChainSpecificAddress(normalizedDest),
              12,
            ),
          },
          components: ["span", "span.highlight"],
        }),
      },
    )
  }

  const basicFeeComp = (
    <Text fs={14} color="white" tAlign="right">
      {t("value.tokenWithSymbol", {
        value: convertedFee,
        symbol: accountCurrencyMeta?.symbol,
        fixedPointScale: 12,
      })}
    </Text>
  )

  const dest = form.watch("dest")
  const shouldShowDisclaimer =
    UNIFIED_ADDRESS_FORMAT_ENABLED &&
    !!dest &&
    dest.toLowerCase() ===
      getAddressVariants(dest).polkadotAddress.toLowerCase()

  const submitDisabled = shouldShowDisclaimer && !disclaimerAccepted

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
      <div sx={{ flex: "column", gap: 12 }}>
        <Controller
          name="dest"
          control={form.control}
          render={({
            field: { name, onChange, value, onBlur },
            fieldState: { error },
          }) => {
            const rightIcon = value ? (
              <CloseIcon
                icon={<CrossIcon />}
                onClick={() => onChange("")}
                name={t("modal.closeButton.name")}
              />
            ) : (
              <PasteAddressIcon
                onClick={async () => {
                  const text = await navigator.clipboard.readText()
                  onChange(text)
                }}
              />
            )

            return (
              <WalletTransferAccountInput
                label={t("wallet.assets.transfer.dest.label")}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={t("wallet.assets.transfer.dest.placeholder")}
                rightIcon={rightIcon}
                onBlur={onBlur}
                error={error?.message}
                openAddressBook={openAddressBook}
              />
            )
          }}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={
                isDesktop
                  ? t("wallet.assets.transfer.asset.label")
                  : t("wallet.assets.transfer.asset.label_mob")
              }
              name={name}
              balance={balance}
              balanceMax={balanceMax}
              value={value}
              onChange={onChange}
              asset={asset}
              error={error?.message}
              onAssetOpen={staticAsset ? undefined : openAssets}
            />
          )}
        />
        {shouldShowDisclaimer && (
          <Alert variant="info" hideIcon>
            <label sx={{ flex: "row", gap: 12, align: "start" }}>
              <Switch
                name="disclaimer-accepted"
                value={disclaimerAccepted}
                onCheckedChange={setDisclaimerAccepted}
              />
              <div>
                <Text fs={13} color="basic100" font="GeistSemiBold">
                  {t("wallet.assets.transfer.disclaimer.cex.title")}
                </Text>
                <Text fs={13} color="basic400">
                  {t("wallet.assets.transfer.disclaimer.cex.description")}
                </Text>
              </div>
            </label>
          </Alert>
        )}
        <SummaryRow
          label={t("wallet.assets.transfer.transaction_cost")}
          content={
            insufficientFee ? (
              <div sx={{ flex: "row", gap: 4 }}>
                {basicFeeComp}
                <Text fs={14} color="brightBlue300" tAlign="right">
                  {t("value.tokenWithSymbol", {
                    value: insufficientFee.displayValue.multipliedBy(
                      spotPrice.data?.spotPrice ?? BN_1,
                    ),
                    symbol: accountCurrencyMeta?.symbol,
                    numberPrefix: "+  ",
                  })}
                </Text>
              </div>
            ) : (
              basicFeeComp
            )
          }
        />
        {asset !== "0" && (
          <Alert variant="warning">
            {t("wallet.assets.transfer.warning.nonNative")}
          </Alert>
        )}
        {insufficientFee && (
          <Alert variant="info">
            {t("wallet.assets.transfer.warning.insufficient", {
              value: insufficientFee.displayValue.multipliedBy(
                spotPrice.data?.spotPrice ?? BN_1,
              ),
              symbol: accountCurrencyMeta?.symbol,
            })}
          </Alert>
        )}
      </div>
      <div>
        <Separator color="darkBlue401" sx={{ mt: 31 }} />
        <div sx={{ flex: "row", justify: "space-between", mt: 20 }}>
          <Button onClick={onClose}>
            {t("wallet.assets.transfer.cancel")}
          </Button>
          <Button type="submit" variant="primary" disabled={submitDisabled}>
            {submitDisabled
              ? t("wallet.assets.transfer.submit.disabled")
              : t("wallet.assets.transfer.submit")}
          </Button>
        </div>
      </div>
    </form>
  )
}
