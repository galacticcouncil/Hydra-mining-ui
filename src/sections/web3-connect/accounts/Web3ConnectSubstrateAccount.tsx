import { ComponentPropsWithoutRef } from "react"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { useNavigate } from "@tanstack/react-location"
import { Web3ConnectAccount } from "./Web3ConnectAccount"
import { useStore } from "state/store"

export const Web3ConnectSubstrateAccount: React.FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = ({ balance, ...account }) => {
  const { account: currentAccount, setAccount, toggle } = useWeb3ConnectStore()
  const { clearTransactions } = useStore()
  const navigate = useNavigate()
  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  return (
    <Web3ConnectAccount
      {...account}
      balance={balance}
      isActive={isActive}
      onClick={(account) => {
        setAccount(account)
        toggle()
        navigate({ search: { account: undefined } })
        clearTransactions()
      }}
    />
  )
}
