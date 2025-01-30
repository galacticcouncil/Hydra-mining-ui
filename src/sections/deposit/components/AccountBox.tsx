import CheckIcon from "assets/icons/CheckIcon.svg?react"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { Button, ButtonTransparent } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useCopy } from "hooks/useCopy"
import { useShallow } from "hooks/useShallow"
import { useTranslation } from "react-i18next"
import {
  createCexWithdrawalUrl,
  useDeposit,
} from "sections/deposit/DepositPage.utils"
import { SAccountBox } from "sections/deposit/steps/deposit/DepositAsset.styled"
import {
  Account,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { safeConvertAddressSS58 } from "utils/formatting"
import { pick } from "utils/rx"

export type AccountBoxProps = Account & {
  ss58Format: number
  error?: string
}

export const AccountBox: React.FC<AccountBoxProps> = ({
  name,
  address,
  displayAddress,
  provider,
  genesisHash,
  ss58Format,
  error,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { asset, cexId } = useDeposit()

  const { copied, copy } = useCopy(5000)

  const { toggle: toggleWeb3Modal } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["toggle"])),
  )

  return (
    <SAccountBox>
      {account && (
        <ButtonTransparent
          sx={{ flex: "row", gap: 6, align: "center" }}
          onClick={() => toggleWeb3Modal()}
        >
          <Text fs={11} color="whiteish500" tTransform="uppercase">
            {t("deposit.cex.account.depositTo")}
          </Text>
          <AccountAvatar
            address={displayAddress || address}
            provider={provider}
            genesisHash={genesisHash}
            size={20}
          />
          <Text fs={14}>{name}</Text>
          <Icon
            size={24}
            icon={<ChevronDown sx={{ color: "basic300", ml: -6 }} />}
          />
        </ButtonTransparent>
      )}
      {error ? (
        <Text fs={14} color="red400">
          {error}
        </Text>
      ) : (
        <Text
          fs={14}
          tAlign="center"
          color="brightBlue300"
          css={{ wordBreak: "break-all" }}
        >
          {safeConvertAddressSS58(address, ss58Format, false)}
        </Text>
      )}
      <div sx={{ flex: "row", gap: 10 }}>
        <Button
          size="micro"
          variant="primary"
          disabled={!!error || copied}
          onClick={() => copy(address)}
        >
          <Icon
            size={14}
            sx={{ ml: -2 }}
            icon={
              copied ? <CheckIcon sx={{ color: "green400" }} /> : <CopyIcon />
            }
          />
          {t("copyAddress")}
        </Button>
        <Button
          size="micro"
          variant="mutedSecondary"
          disabled={!!error}
          onClick={() =>
            asset &&
            window.open(createCexWithdrawalUrl(cexId, asset.data), "_blank")
          }
        >
          <Icon size={10} sx={{ ml: -2 }} icon={<LinkIcon />} />
          {t("open")} {cexId}
        </Button>
      </div>
    </SAccountBox>
  )
}
