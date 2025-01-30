import { Root as DialogRoot } from "@radix-ui/react-dialog"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useTranslation } from "react-i18next"
import { CEX_CONFIG, useDeposit } from "sections/deposit/DepositPage.utils"
import { DepositCexSelect } from "sections/deposit/steps/deposit/DepositCexSelect"
import { WithdrawMethodSelect } from "sections/deposit/steps/withdraw/WithdrawMethodSelect"
import { WithdrawSuccess } from "sections/deposit/steps/withdraw/WithdrawSuccess"
import { WithdrawTransfer } from "sections/deposit/steps/withdraw/WithdrawTransfer"
import { SContainer, SDepositContent } from "./DepositPage.styled"

export const WithdrawPage = () => {
  const { t } = useTranslation()
  const {
    cexId,
    back,
    direction,
    page,
    reset,
    setAsset,
    setDepositMethod,
    setSuccess,
  } = useDeposit()

  const activeCex = CEX_CONFIG.find(({ id }) => id === cexId)

  return (
    <SContainer>
      <SDepositContent data-page={page}>
        <DialogRoot open modal={false}>
          <ModalContents
            onBack={back}
            page={page}
            direction={direction}
            contents={[
              {
                content: <WithdrawMethodSelect onSelect={setDepositMethod} />,
              },
              {
                title: t("withdraw.cex.select.title").toUpperCase(),
                headerVariant: "GeistMono",
                noPadding: true,
                content: <DepositCexSelect onAssetSelect={setAsset} />,
              },
              {
                title: t("withdraw.cex.transfer.title", {
                  cex: activeCex?.title,
                }).toUpperCase(),
                headerVariant: "GeistMono",
                content: <WithdrawTransfer onTransferSuccess={setSuccess} />,
              },
              { content: null },
              {
                hideBack: true,
                content: <WithdrawSuccess onConfirm={reset} />,
              },
            ]}
          />
        </DialogRoot>
      </SDepositContent>
    </SContainer>
  )
}
