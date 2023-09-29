import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { ButtonTransparent } from "components/Button/Button"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import LogoutIcon from "assets/icons/LogoutIcon.svg?react"
import ExternalWalletIcon from "assets/icons/ExternalWalletIcon.svg?react"
import WalletConnect from "assets/icons/WalletConnect.svg?react"
import { Account, externalWallet } from "state/store"
import { useTranslation } from "react-i18next"
import {
  SContainer,
  SLogoutContainer,
  SSwitchButton,
  SSwitchText,
} from "./WalletConnectActiveFooter.styled"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useMedia } from "react-use"
import { getWalletMeta } from "./WalletConnectModal.utils"
import { Icon } from "components/Icon/Icon"

export function WalletConnectActiveFooter(props: {
  account: Account | undefined
  provider: string
  onSwitch: () => void
  onLogout: () => void
}) {
  const { t } = useTranslation()
  const wallet = getWalletBySource(props.provider)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isNovaWallet = window.walletExtension?.isNovaWallet || !isDesktop
  const walletMeta = getWalletMeta(wallet, isNovaWallet)

  return (
    <SContainer>
      {props.account ? (
        <ButtonTransparent onClick={props.onLogout}>
          <SLogoutContainer>
            <LogoutIcon css={{ color: theme.colors.basic500 }} />
            <Text css={{ color: theme.colors.basic500 }} fs={14} fw={500}>
              {t("walletConnect.logout")}
            </Text>
          </SLogoutContainer>
        </ButtonTransparent>
      ) : (
        <span />
      )}

      <SSwitchButton onClick={props.onSwitch}>
        <div sx={{ flex: "row", gap: 22, align: "center" }}>
          <div sx={{ flex: "row", gap: 12, align: "center" }}>
            {props.provider === externalWallet.provider ? (
              <>
                <Icon icon={<ExternalWalletIcon />} />
                <Text fs={14} fw={600} css={{ color: theme.colors.basic500 }}>
                  {t("walletConnect.externalWallet")}
                </Text>
              </>
            ) : props.provider === "WalletConnect" ? (
              <>
                <Icon size={40} icon={<WalletConnect />} />
                <Text fs={14} fw={600} css={{ color: theme.colors.basic500 }}>
                  {t("walletConnect.wc")}
                </Text>
              </>
            ) : (
              <>
                <img
                  src={walletMeta?.logo.src}
                  alt={walletMeta?.logo.alt}
                  width={30}
                  height={30}
                />
                <Text fs={14} fw={600} css={{ color: theme.colors.basic500 }}>
                  {walletMeta?.title}
                </Text>
              </>
            )}
          </div>
          <SSwitchText fs={14} fw={500}>
            <span>{t("walletConnect.switch")}</span>
            <ChevronRight css={{ marginLeft: -3, marginTop: 2 }} />
          </SSwitchText>
        </div>
      </SSwitchButton>
    </SContainer>
  )
}
