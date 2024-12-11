import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers"
import { useMutation } from "@tanstack/react-query"
import { useAccountFeePaymentAssets } from "api/payments"
import { useSpotPrice } from "api/spotPrice"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Summary } from "components/Summary/Summary"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useNextEvmPermitNonce } from "sections/transaction/ReviewTransaction.utils"
import { ReviewTransactionData } from "sections/transaction/ReviewTransactionData"
import { useEvmTxFee } from "sections/transaction/ReviewTransactionEvmTxForm.utils"
import {
  EthereumSigner,
  PermitResult,
} from "sections/web3-connect/signer/EthereumSigner"
import {
  useEvmAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { NATIVE_EVM_ASSET_ID } from "utils/evm"

type Props = {
  title?: string
  onCancel: () => void
  tx: {
    data: TransactionRequest
    abi?: string
  }
  onPermitDispatched: ({ permit }: { permit: PermitResult }) => void
  onEvmSigned: (data: { evmTx: TransactionResponse }) => void
}

export const ReviewTransactionEvmTxForm: FC<Props> = ({
  title,
  tx,
  onEvmSigned,
  onPermitDispatched,
  onCancel,
}) => {
  const { t } = useTranslation()
  const { account } = useEvmAccount()
  const { wallet } = useWallet()
  const { getAsset } = useAssets()
  const { feePaymentAssetId } = useAccountFeePaymentAssets()

  const { data: nonce } = useNextEvmPermitNonce(account?.address)
  const { data: spotPrice } = useSpotPrice(
    NATIVE_EVM_ASSET_ID,
    feePaymentAssetId,
  )

  const shouldUsePermit = feePaymentAssetId !== NATIVE_EVM_ASSET_ID

  const { data: feeWETH, isLoading: isFeeLoading } = useEvmTxFee(tx.data)

  const { mutate: signTx, isLoading } = useMutation(async () => {
    if (!account?.address) throw new Error("Missing active account")
    if (!wallet) throw new Error("Missing wallet")
    if (!wallet.signer) throw new Error("Missing signer")

    if (wallet?.signer instanceof EthereumSigner) {
      if (shouldUsePermit) {
        if (!nonce) throw new Error("Missing nonce")
        const permit = await wallet.signer.getPermit(tx.data, nonce)
        return onPermitDispatched({ permit })
      }
      const evmTx = await wallet.signer.sendTransaction(tx.data)
      onEvmSigned({ evmTx })
    }
  })

  const feePaymentAsset = feePaymentAssetId ? getAsset(feePaymentAssetId) : null
  const formattedFee = feeWETH?.multipliedBy(spotPrice?.spotPrice ?? 0)

  return (
    <>
      {title && (
        <Text color="basic400" fw={400} sx={{ mb: 16 }}>
          {title}
        </Text>
      )}
      <ModalScrollableContent
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          p: "var(--modal-content-padding)",
          maxHeight: 280,
        }}
        css={{ backgroundColor: `rgba(${theme.rgbColors.alpha0}, .06)` }}
        content={<ReviewTransactionData evmTx={tx} />}
        footer={
          <div sx={{ mt: 15 }}>
            <Summary
              rows={[
                {
                  label: t("liquidity.reviewTransaction.modal.detail.cost"),
                  content: (
                    <>
                      {isFeeLoading ? (
                        <Skeleton width={100} height={16} />
                      ) : (
                        <Text fs={14}>
                          {t("liquidity.add.modal.row.transactionCostValue", {
                            amount: formattedFee,
                            symbol: feePaymentAsset?.symbol,
                            type: "token",
                          })}
                        </Text>
                      )}
                    </>
                  ),
                },
              ]}
            />
            <div
              sx={{
                mt: ["auto", 24],
                flex: "row",
                justify: "space-between",
                align: "start",
              }}
            >
              <Button
                onClick={onCancel}
                text={t("liquidity.reviewTransaction.modal.cancel")}
              />
              <div sx={{ flex: "column", justify: "center", gap: 4 }}>
                <Button
                  variant="primary"
                  onClick={() => signTx()}
                  isLoading={isLoading}
                  disabled={isLoading}
                  text={
                    isLoading
                      ? t(
                          "liquidity.reviewTransaction.modal.confirmButton.loading",
                        )
                      : t("liquidity.reviewTransaction.modal.confirmButton")
                  }
                />
                {isLoading && (
                  <Text fs={12} lh={16} tAlign="center" color="warning300">
                    {t(
                      "liquidity.reviewTransaction.modal.confirmButton.warning",
                    )}
                  </Text>
                )}
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}
