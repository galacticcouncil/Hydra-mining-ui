import { zodResolver } from "@hookform/resolvers/zod"
import {
  useCrossChainTransaction,
  useCrossChainTransfer,
  useCrossChainWallet,
} from "api/xcm"
import BN from "bignumber.js"
import { AddressBook } from "components/AddressBook/AddressBook"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDeposit } from "sections/deposit/DepositPage.utils"
import { useZodSchema } from "sections/deposit/steps/DepositTransfer.utills"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_NAN } from "utils/constants"
import { FormValues } from "utils/helpers"

export type DepositTransferProps = {
  onTransferSuccess: () => void
}

export const DepositTransfer: React.FC<DepositTransferProps> = ({
  onTransferSuccess,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { asset, setDepositedAmount } = useDeposit()
  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const address = account?.address ?? ""
  const srcChain = asset?.route[0] ?? ""

  const wallet = useCrossChainWallet()

  const { data: xTransfer } = useCrossChainTransfer(wallet, {
    asset: asset?.data.asset.key ?? "",
    srcAddr: address,
    dstAddr: address,
    srcChain: srcChain,
    dstChain: "hydration",
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

  const zodSchema = useZodSchema({
    min: transferData.min,
    max: transferData.max,
    symbol: transferData.symbol,
    decimals: transferData.decimals,
  })

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      address,
    },
    resolver: zodResolver(zodSchema),
  })

  const dstAddress = form.watch("address")

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (!asset) return

    await sendTx({
      asset: asset.data.asset.key,
      wallet,
      amount: values.amount,
      srcAddr: address,
      dstAddr: dstAddress,
      srcChain: srcChain,
      dstChain: "hydration",
    })

    setDepositedAmount(
      BigInt(BN(values.amount).shiftedBy(transferData.decimals).toString()),
    )
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
                />
              </div>
            )}
          />
          <Button isLoading={isLoading} disabled={isLoading} variant="primary">
            {t("deposit.cex.transfer.button")}
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
