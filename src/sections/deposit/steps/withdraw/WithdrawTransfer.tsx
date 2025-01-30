import { zodResolver } from "@hookform/resolvers/zod"
import {
  useCrossChainTransaction,
  useCrossChainTransfer,
  useCrossChainWallet,
} from "api/xcm"
import BN from "bignumber.js"
import { AddressBook } from "components/AddressBook/AddressBook"
import { Alert } from "components/Alert"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  CEX_CONFIG,
  useDeposit,
  useTransferSchema,
} from "sections/deposit/DepositPage.utils"
import { useWithdrawalToCex } from "sections/deposit/steps/withdraw/WithdrawTransfer.utils"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_NAN } from "utils/constants"
import { FormValues } from "utils/helpers"

export type WithdrawTransferProps = {
  onTransferSuccess: () => void
}

export const WithdrawTransfer: React.FC<WithdrawTransferProps> = ({
  onTransferSuccess,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { asset, cexId } = useDeposit()
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)
  const address = account?.address ?? ""
  const dstChain = asset?.route[0] ?? ""

  const wallet = useCrossChainWallet()

  const { data: xTransfer } = useCrossChainTransfer(wallet, {
    asset: asset?.data.asset.key ?? "",
    srcAddr: address,
    dstAddr: address,
    srcChain: "hydration",
    dstChain,
  })

  const transferData = useMemo(() => {
    if (!xTransfer)
      return {
        balance: BN_NAN,
        min: BN_NAN,
        max: BN_NAN,
        symbol: "",
        decimals: 0,
      }

    const { balance, min, max } = xTransfer.source

    return {
      symbol: balance.symbol,
      decimals: balance.decimals,
      balance: BN(balance.amount.toString()),
      min: BN(min.amount.toString()),
      max: BN(max.amount.toString()),
    }
  }, [xTransfer])

  const { mutateAsync: sendTx, isLoading } = useCrossChainTransaction({
    onSuccess: onTransferSuccess,
  })

  const zodSchema = useTransferSchema({
    min: transferData.min,
    max: transferData.max,
    symbol: transferData.symbol,
    decimals: transferData.decimals,
  })

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      address: "",
    },
    resolver: zodResolver(zodSchema),
  })

  const { mutateAsync: withdrawToCex } = useWithdrawalToCex(
    cexId,
    asset?.assetId ?? "",
  )

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (!asset) return

    await sendTx({
      wallet,
      asset: asset.data.asset.key,
      amount: values.amount,
      srcAddr: address,
      dstAddr: address,
      srcChain: "hydration",
      dstChain,
    })

    await withdrawToCex({
      cexAddress: values.address,
      amount: values.amount,
    })
  }

  function toggleAddressBook() {
    setAddressBookOpen((open) => !open)
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <div sx={{ flex: "column", gap: [14, 20] }}>
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <div sx={{ flex: "column" }}>
                <AssetSelect
                  name={field.name}
                  value={field.value}
                  id={asset?.assetId ?? ""}
                  error={fieldState.error?.message}
                  title={t("selectAssets.asset")}
                  onChange={field.onChange}
                  balance={transferData.balance}
                  balanceMax={
                    !transferData.max.isNaN() ? transferData.max : undefined
                  }
                  balanceLabel={t("selectAsset.balance.label")}
                />
              </div>
            )}
          />
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <div sx={{ flex: "column", mx: [-16, 0] }}>
                <WalletTransferAccountInput
                  label={t("xcm.transfer.destAddress")}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("wallet.assets.transfer.dest.placeholder")}
                  openAddressBook={toggleAddressBook}
                  error={fieldState.error?.message}
                  hideNativeAddress
                />
              </div>
            )}
          />
          <Alert variant="info" hideIcon>
            <label sx={{ flex: "row", gap: 12, align: "start" }}>
              <Switch
                name="disclaimer-accepted"
                value={disclaimerAccepted}
                onCheckedChange={setDisclaimerAccepted}
              />
              <div>
                <Text fs={13} color="basic100" font="GeistSemiBold">
                  {t("withdraw.disclaimer.cex.title", {
                    cex: activeCex?.title,
                    symbol: asset?.data.asset.originSymbol,
                  })}
                </Text>
                <Text fs={13} color="basic400">
                  {t("withdraw.disclaimer.cex.description")}
                </Text>
              </div>
            </label>
          </Alert>
          <Button
            isLoading={isLoading}
            disabled={isLoading || !disclaimerAccepted}
            variant="primary"
          >
            {disclaimerAccepted
              ? t("withdraw.transfer.button")
              : t("withdraw.disclaimer.button")}
          </Button>
        </div>
      </form>
      <Modal
        open={addressBookOpen}
        onClose={toggleAddressBook}
        title={t("deposit.cex.transfer.addressbook.title")}
        headerVariant="gradient"
      >
        <AddressBook
          onSelect={(address) => {
            form.setValue("address", address)
            setAddressBookOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
