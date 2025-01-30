import { ModalContents } from "components/Modal/contents/ModalContents"
import { useTranslation } from "react-i18next"
import {
  useConnectedProvider,
  useWalletAccounts,
  WalletProviderType,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectAccountList } from "sections/web3-connect/accounts/Web3ConnectAccountList"
import { Web3ConnectError } from "sections/web3-connect/modal/Web3ConnectError"
import { Web3ConnectExternalForm } from "sections/web3-connect/modal/Web3ConnectExternalForm"
import { Web3ConnectProviderPending } from "sections/web3-connect/providers/Web3ConnectProviderPending"
import { Web3ConnectProviders } from "sections/web3-connect/providers/Web3ConnectProviders"
import {
  useWeb3ConnectStore,
  WalletMode,
  WalletProviderState,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AddressBook } from "components/AddressBook/AddressBook"
import { useForm } from "react-hook-form"
import { Web3ConnectFooter } from "sections/web3-connect/modal/Web3ConnectFooter"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { validAddress } from "utils/validators"
import { ExternalWallet } from "sections/web3-connect/wallets/ExternalWallet"
import { TFunction } from "i18next"

type Props = {
  page: number
  direction?: number
  onClose: () => void
  onBack: () => void
  onSelect: () => void
  onRetry: () => void
  onSwitch: () => void
  onLogout: () => void
  onOpenAddressBook: () => void
  onCloseAddressBook: () => void
}

export const Web3ConnectContent: React.FC<Props> = ({
  onSelect,
  onRetry,
  onSwitch,
  onLogout,
  onOpenAddressBook,
  onCloseAddressBook,
  ...props
}) => {
  const { t } = useTranslation()
  const {
    recentProvider,
    mode,
    disconnect,
    error,
    meta,
    getConnectedProviders,
  } = useWeb3ConnectStore()

  const { data: accounts, isLoading: isAccountsLoading } = useWalletAccounts()

  const providers = getConnectedProviders()
  const isProvidersConnecting = providers.some(
    ({ status }) => status === "pending",
  )

  const { wallet: externalWallet } = useConnectedProvider(
    WalletProviderType.ExternalWallet,
  )

  const externalWalletForm = useForm<{
    address: string
    delegates: boolean
  }>({
    mode: "onChange",
    defaultValues: {
      address:
        externalWallet instanceof ExternalWallet
          ? externalWallet?.account?.address ?? ""
          : "",
    },
    resolver: zodResolver(
      z.object({
        address: validAddress,
      }),
    ),
  })

  return (
    <ModalContents
      {...props}
      contents={[
        {
          title: meta?.title ?? t("walletConnect.provider.title").toUpperCase(),
          content: <Web3ConnectProviders onAccountSelect={onSelect} />,
          headerVariant: "gradient",
          description: meta?.description ?? getModalDescription(t, mode, meta),
        },
        {
          title: t("walletConnect.externalWallet.modal.title").toUpperCase(),
          description: t("walletConnect.externalWallet.modal.desc"),
          content: (
            <Web3ConnectExternalForm
              form={externalWalletForm}
              onClose={props.onClose}
              onSelect={onSelect}
              onDisconnect={onSwitch}
              onOpenAddressBook={onOpenAddressBook}
            />
          ),
        },
        {
          title:
            meta?.title ?? t("walletConnect.accountSelect.title").toUpperCase(),
          description:
            meta?.description ?? t("walletConnect.accountSelect.description"),
          content: (
            <>
              {isAccountsLoading || isProvidersConnecting ? (
                <Web3ConnectProviderPending
                  provider={
                    isAccountsLoading
                      ? providers.map(({ type }) => type)
                      : recentProvider
                  }
                />
              ) : (
                <Web3ConnectAccountList
                  isLoading={isAccountsLoading}
                  accounts={accounts}
                />
              )}
              <Web3ConnectFooter onSwitch={onSwitch} onLogout={onLogout} />
            </>
          ),
        },
        {
          title: t("walletConnect.provider.title").toUpperCase(),
          content: (
            <Web3ConnectError
              message={error}
              onRetry={() => {
                disconnect(recentProvider || undefined)
                onRetry?.()
              }}
            />
          ),
        },
        {
          title: t("addressbook.title").toUpperCase(),
          content: (
            <AddressBook
              onSelect={(address) => {
                externalWalletForm.setValue("address", address, {
                  shouldValidate: true,
                })
                onCloseAddressBook?.()
              }}
            />
          ),
        },
      ]}
    />
  )
}

const getModalDescription = (
  t: TFunction,
  mode: WalletMode,
  meta: WalletProviderState["meta"],
) => {
  const chain = meta?.chain ? chainsMap.get(meta?.chain) : null

  if (!chain) return ""

  if (mode === WalletMode.EVM) {
    return t("walletConnect.provider.description.evmChain", {
      chain: chain.name,
    })
  }

  if (mode === WalletMode.Solana) {
    return t("walletConnect.provider.description.solanaChain", {
      chain: chain.name,
    })
  }

  return t("walletConnect.provider.description.substrateChain", {
    chain: chain.name,
  })
}
