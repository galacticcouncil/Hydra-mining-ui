import { Edit, Save, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonTransparent,
  Flex,
  Icon,
  Input,
  Spinner,
  Text,
  TextButton,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FormEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useClickAway, useMount } from "react-use"

import { bestNumberQuery } from "@/api/chain"
import { rpcInfoQuery } from "@/api/rpc"
import { RpcRemoveModal } from "@/components/ProviderRpcSelect/components/RpcRemoveModal"
import { RpcStatus } from "@/components/ProviderRpcSelect/components/RpcStatus"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useRpcListStore } from "@/states/provider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { RpcInfoResult } from "@/utils/rpc"

import { SRpcListItem, SRpcRadio, SRpcRadioThumb } from "./RpcListItem.styled"

export type RpcListItemProps = {
  name: string
  url: string
  isActive: boolean
  isCustom: boolean
  onClick: (url: string) => void
  onRemove: (url: string) => void
}

export const RpcListHeader: React.FC = () => {
  const { t } = useTranslation()
  return (
    <SRpcListItem bg={getToken("details.separatorsOnDim")}>
      <Text fs="p5" color={getToken("text.medium")}>
        {t("rpc.change.modal.column.name")}
      </Text>
      <Text fs="p5" color={getToken("text.medium")}>
        {t("rpc.change.modal.column.status")}
      </Text>
      <Text
        fs="p5"
        color={getToken("text.medium")}
        display={["none", "block"]}
        align="right"
      >
        {t("rpc.change.modal.column.rpc")}
      </Text>
    </SRpcListItem>
  )
}

type RpcListItemEditProps = Pick<RpcListItemProps, "url" | "name"> & {
  onCancel: () => void
}

const RpcListItemEdit: React.FC<RpcListItemEditProps> = ({
  name,
  url,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [customName, setCustomName] = useState(name)
  const [error, setError] = useState("")
  const { renameRpc } = useRpcListStore()

  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useClickAway(formRef, () => onCancel())

  useMount(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!customName) {
      setError(t("error.required"))
      return
    }
    renameRpc(url, customName)
    onCancel()
  }

  const setName = (name: string) => {
    setCustomName(name)
    setError("")
  }

  return (
    <SRpcListItem as="form" data-edit="true" ref={formRef} onSubmit={onSubmit}>
      <Input
        variant="embedded"
        sx={{ px: 0, fontSize: 16, fontWeight: 400 }}
        value={customName}
        onChange={(e) => setName(e.target.value)}
        ref={inputRef}
      />
      {error && (
        <Text
          fs={12}
          color={getToken("accents.danger.secondary")}
          sx={{ position: "absolute", pointerEvents: "none" }}
        >
          {error}
        </Text>
      )}
      <Flex
        align="center"
        justify="end"
        gap={12}
        color={getToken("text.medium")}
      >
        <Text>{new URL(url).hostname}</Text>
        <ButtonTransparent
          type="submit"
          sx={{ lineHeight: 1, color: getToken("text.tint.primary"), gap: 8 }}
        >
          {t("save")}
          <Icon size={16} component={Save} />
        </ButtonTransparent>
      </Flex>
    </SRpcListItem>
  )
}

const RpcListItemLayout: React.FC<
  RpcListItemProps & Partial<RpcInfoResult>
> = ({ onClick, onRemove, isActive, isCustom, url, name, ...status }) => {
  const { t } = useTranslation()
  const [isEdit, setIsEdit] = useState(false)

  const { isApiLoaded } = useRpcProvider()

  if (isEdit) {
    return (
      <RpcListItemEdit
        url={url}
        name={name}
        onCancel={() => setIsEdit(false)}
      />
    )
  }

  const isLoading = isActive && !isApiLoaded

  return (
    <SRpcListItem data-loading={isLoading} onClick={() => onClick(url)}>
      <Box>
        <Text
          fs={[14, 16]}
          color={getToken(isActive ? "colors.coral.700" : "text.high")}
        >
          {name}
        </Text>
        <Text
          fs={10}
          mt={2}
          display={["block", "none"]}
          color={getToken("text.medium")}
        >
          {new URL(url).hostname}
        </Text>
      </Box>
      <Box>
        {status.blockNumber ? <RpcStatus {...status} /> : <Spinner size={14} />}
      </Box>
      <Flex
        color={getToken("text.medium")}
        gap={4}
        justify="end"
        align="center"
      >
        <Text display={["none", "block"]}>{new URL(url).hostname}</Text>
        {isCustom && (
          <>
            <RpcRemoveModal
              onRemove={() => onRemove(url)}
              trigger={
                <TextButton
                  sx={{ p: 4 }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Icon size={16} component={Trash} />
                </TextButton>
              }
            />
            <Tooltip text={t("edit")} asChild side="top">
              <TextButton
                sx={{ p: 4 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEdit(true)
                }}
              >
                <Icon size={16} component={Edit} />
              </TextButton>
            </Tooltip>
          </>
        )}
        <Box sx={{ ml: 8 }}>
          {isLoading ? (
            <Spinner size={14} />
          ) : (
            <SRpcRadio>{isActive && <SRpcRadioThumb />}</SRpcRadio>
          )}
        </Box>
      </Flex>
    </SRpcListItem>
  )
}

const RpcListItemActive: React.FC<
  RpcListItemProps & Partial<RpcInfoResult> & { ping?: number }
> = (props) => {
  const provider = useRpcProvider()
  const { data: bestNumber } = useQuery(bestNumberQuery(provider))

  return (
    <RpcListItemLayout
      {...props}
      blockNumber={bestNumber?.parachainBlockNumber}
      timestamp={bestNumber?.timestamp}
    />
  )
}

export const RpcListItem: React.FC<RpcListItemProps> = (props) => {
  const { data: status } = useQuery({
    ...rpcInfoQuery(props.url),
    refetchInterval: PARACHAIN_BLOCK_TIME / 2,
    placeholderData: keepPreviousData,
  })
  return props.isActive ? (
    <RpcListItemActive {...props} {...status} />
  ) : (
    <RpcListItemLayout {...props} {...status} />
  )
}
