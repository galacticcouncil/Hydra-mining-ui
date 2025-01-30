import BanxaLogo from "assets/icons/BanxaLogo.png"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SCryptoBlock } from "./DepositCrypto.styled"

export const DepositCrypto = () => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <SCryptoBlock href="https://banxa.com" rel="noreferrer" target="_blank">
        <div>
          <img
            src={BanxaLogo}
            width={100}
            height={16}
            alt="Banxa"
            sx={{ mb: 10 }}
          />
          <Text color="basic400">{t("deposit.crypto.banxa.description")}</Text>
        </div>
        <Text
          fs={[16, 14]}
          sx={{ flex: "row", align: "center" }}
          css={{ whiteSpace: "nowrap" }}
          color="brightBlue300"
        >
          {t("deposit.crypto.banxa.buy")} <ChevronRight />
        </Text>
      </SCryptoBlock>
    </SContainer>
  )
}
