import { useNavigate } from "@tanstack/react-location"
import { ComponentPropsWithoutRef, FC } from "react"
import { useTranslation } from "react-i18next"
import { useConnectedProvider } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import {
  SAccountItem,
  SChangeAccountButton,
} from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { useStore } from "state/store"
import { isMetaMask, isMetaMaskLike, requestAccounts } from "utils/metamask"

export const Web3ConnectEvmAccount: FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = ({ balance, ...account }) => {
  const { t } = useTranslation()
  const { account: currentAccount, setAccount, toggle } = useWeb3ConnectStore()
  const { clearTransactions } = useStore()
  const { wallet } = useConnectedProvider(account.provider)
  const navigate = useNavigate()

  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  // Allow account changing for MetaMask wallets,
  // but disable for MetaMask-like as it doesn't provide a way to open the account selection programmatically
  const shouldAllowAccountChange =
    isActive &&
    isMetaMask(wallet?.extension) &&
    !isMetaMaskLike(wallet?.extension)

  return (
    <div>
      <SAccountItem
        isActive={isActive}
        withButton={shouldAllowAccountChange}
        onClick={() => {
          setAccount(account)
          toggle()
          navigate({ search: { account: undefined } })
          clearTransactions()
        }}
      >
        <Web3ConnectAccountSelect
          address={account.displayAddress ?? ""}
          balance={balance}
          provider={account.provider}
          name={account.name}
          isActive={isActive}
        />
      </SAccountItem>
      {shouldAllowAccountChange && (
        <SChangeAccountButton
          variant="outline"
          fullWidth
          size="small"
          onClick={() => requestAccounts(wallet?.extension)}
        >
          {t("walletConnect.accountSelect.change")}
        </SChangeAccountButton>
      )}
    </div>
  )
}
