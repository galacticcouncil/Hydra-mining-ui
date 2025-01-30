import { css } from "@emotion/react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { Text } from "components/Typography/Text/Text"
import { useMedia } from "react-use"
import { safeConvertAddressSS58, shortenAccountAddress } from "utils/formatting"
import { theme as themeParams } from "theme"
import {
  SOLANA_PROVIDERS,
  WalletProviderType,
} from "sections/web3-connect/constants/providers"
import BigNumber from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_BILL, UNIFIED_ADDRESS_FORMAT_ENABLED } from "utils/constants"
import { getWalletProviderByType } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAddress } from "utils/evm"
import { Badge } from "components/Badge/Badge"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  SCopyDropdownContent,
  SCopyDropdownItem,
} from "sections/web3-connect/accounts/Web3ConnectAccountSelect.styled"
import { ButtonTransparent } from "components/Button/Button"
import CheckIcon from "assets/icons/CheckIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { genesisHashToChain } from "utils/helpers"
import { useCopy } from "hooks/useCopy"
import { useTranslation } from "react-i18next"

type Props = {
  name: string
  genesisHash?: `0x${string}`
  address: string
  balance?: string
  balanceSymbol?: string
  balanceDecimals?: number
  onClick?: () => void
  provider?: WalletProviderType | null
  isProxy?: boolean
  isActive?: boolean
}

const CopyButton: React.FC<{
  address: string
  className?: string
  children?: React.ReactNode
  wrapper?: React.ElementType
}> = ({ address, children, className, wrapper }) => {
  const { copied, copy } = useCopy(5000)

  const Wrapper = wrapper || ButtonTransparent

  function copyHandler(e: React.MouseEvent) {
    e.stopPropagation()
    copy(address)
  }

  return (
    <Wrapper className={className} onClick={copyHandler}>
      <span>{children}</span>
      <Icon
        css={{ cursor: "pointer", "&:hover": { filter: "brightness(1.5)" } }}
        size={18}
        icon={copied ? <CheckIcon sx={{ color: "green400" }} /> : <CopyIcon />}
      />
    </Wrapper>
  )
}

export const Web3ConnectAccountSelect = ({
  name,
  genesisHash,
  address,
  balance,
  balanceSymbol,
  balanceDecimals,
  onClick,
  isActive,
  provider,
}: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(themeParams.viewport.gte.sm)
  const { wallet } = getWalletProviderByType(provider)
  const isEvm = isEvmAddress(address)
  const isSol = !!provider && SOLANA_PROVIDERS.includes(provider)

  const addressOldFormat = safeConvertAddressSS58(
    address,
    genesisHashToChain(genesisHash).prefix,
    false,
  )

  return (
    <div onClick={onClick} sx={{ flex: "row", align: "center", gap: 12 }}>
      <AccountAvatar
        address={address}
        genesisHash={genesisHash}
        provider={provider}
        size={32}
        sx={{ flexShrink: 0 }}
      />

      <div sx={{ flex: "column", gap: 6 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", justify: "space-between" }}>
          <div sx={{ flex: "row", align: "center", gap: 4 }}>
            {wallet && (
              <img
                loading="lazy"
                src={wallet.logo.src}
                alt={wallet.logo.alt}
                width={12}
                height={12}
              />
            )}
            <Text fs={14} color="white">
              {name}
            </Text>
            {isEvm && (
              <Badge size="small" variant="orange" rounded={false}>
                {t("walletConnect.provider.mode.evm")}
              </Badge>
            )}
            {isSol && (
              <Badge size="small" variant="secondary" rounded={false}>
                {t("walletConnect.provider.mode.solana")}
              </Badge>
            )}
          </div>
          <Text fs={14} color="graySoft">
            {balance && !balanceSymbol && (
              <DisplayValue
                value={BigNumber(balance)}
                compact={BigNumber(balance).gt(BN_BILL)}
              />
            )}
            {balance &&
              balanceSymbol &&
              balanceDecimals &&
              t("value.tokenWithSymbol", {
                value: balance,
                symbol: balanceSymbol,
                fixedPointScale: balanceDecimals,
              })}
          </Text>
        </div>
        <div sx={{ flex: "row", justify: "space-between" }}>
          <Text
            fs={13}
            color={isActive ? "brightBlue200" : "darkBlue200"}
            css={css`
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            `}
          >
            {isDesktop ? address : shortenAccountAddress(address, 12)}
          </Text>
          <div sx={{ mt: -4 }}>
            {isEvm || !UNIFIED_ADDRESS_FORMAT_ENABLED ? (
              <CopyButton
                address={address}
                sx={{
                  color: isActive ? "brightBlue200" : "darkBlue200",
                }}
              />
            ) : (
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <ButtonTransparent onClick={(e) => e.stopPropagation()}>
                    <CopyIcon
                      width={18}
                      height={18}
                      sx={{
                        color: isActive ? "brightBlue200" : "darkBlue200",
                      }}
                    />
                  </ButtonTransparent>
                </Tooltip.Trigger>
                <SCopyDropdownContent
                  align="end"
                  side="bottom"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CopyButton
                    wrapper={SCopyDropdownItem}
                    address={address}
                    sx={{ gap: [50, 100] }}
                  >
                    {t("walletConnect.copy.format.new")}
                  </CopyButton>
                  {addressOldFormat && (
                    <CopyButton
                      wrapper={SCopyDropdownItem}
                      address={addressOldFormat}
                      sx={{ gap: [50, 100] }}
                    >
                      {t("walletConnect.copy.format.old")}
                    </CopyButton>
                  )}
                </SCopyDropdownContent>
              </Tooltip.Root>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
