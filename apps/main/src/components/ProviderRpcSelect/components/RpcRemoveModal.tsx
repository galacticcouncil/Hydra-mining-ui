import {
  Button,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type RpcRemoveModalProps = {
  trigger: React.ReactNode
  onRemove: () => void
}

export const RpcRemoveModal: React.FC<RpcRemoveModalProps> = ({
  trigger,
  onRemove,
}) => {
  const { t } = useTranslation()
  return (
    <ModalRoot>
      <Tooltip text={t("remove")} asChild side="top">
        <ModalTrigger asChild>{trigger}</ModalTrigger>
      </Tooltip>
      <ModalContent>
        <ModalHeader title={t("rpc.change.modal.removeRpc.title")}>
          <Text fs="p3" color={getToken("text.medium")}>
            {t("rpc.change.modal.removeRpc.desc")}
          </Text>
        </ModalHeader>
        <ModalFooter justify="space-between">
          <ModalClose>
            <Button size="large" variant="secondary">
              {t("cancel")}
            </Button>
          </ModalClose>
          <Button size="large" onClick={onRemove}>
            {t("rpc.change.modal.removeRpc.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalRoot>
  )
}
