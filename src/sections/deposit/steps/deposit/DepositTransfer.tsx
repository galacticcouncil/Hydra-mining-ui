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
import {
  useDeposit,
  useTransferSchema,
} from "sections/deposit/DepositPage.utils"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_NAN } from "utils/constants"
import { H160, isEvmAddress } from "utils/evm"
import { FormValues } from "utils/helpers"

export type DepositTransferProps = {
  onTransferSuccess: () => void
}

export const DepositTransfer: React.FC<DepositTransferProps> = ({
  onTransferSuccess,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { asset, depositedAmount, setDepositedAmount } = useDeposit()
  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const address = account?.address ?? ""
  const srcChain = asset?.route[0] ?? ""

  const wallet = useCrossChainWallet()

  const { data: xTransfer } = useCrossChainTransfer(
    wallet,
    {
      asset: asset?.data.asset.key ?? "",
      srcAddr: address,
      dstAddr: address,
      srcChain: srcChain,
      dstChain: "hydration",
    },
    {
      onSuccess: ({ source }) => {
        if (depositedAmount && !form.getValues("amount")) {
          const amount = BN.min(
            depositedAmount.toString(),
            source.max.amount.toString(),
          )

          const shiftedAmount = amount.shiftedBy(-source.balance.decimals)
          form.setValue("amount", shiftedAmount.toString())
        }
      },
    },
  )

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
      address,
    },
    resolver: zodResolver(zodSchema),
  })

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (!asset) return

    await sendTx({
      wallet,
      asset: asset.data.asset.key,
      amount: values.amount,
      srcAddr: isEvmAddress(address) ? new H160(address).toAccount() : address,
      dstAddr: isEvmAddress(values.address)
        ? new H160(values.address).toAccount()
        : values.address,
      srcChain: srcChain,
      dstChain: "hydration",
    })

    const depositedAmount = BN(values.amount)
      .shiftedBy(transferData.decimals)
      .toString()

    setDepositedAmount(BigInt(depositedAmount))
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
