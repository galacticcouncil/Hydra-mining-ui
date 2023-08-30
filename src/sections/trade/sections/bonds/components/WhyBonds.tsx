import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Step } from "./Step"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { Icon } from "components/Icon/Icon"
import { whyBonds } from "sections/trade/sections/bonds/Bonds.utils"
import { useTranslation } from "react-i18next"
import { SWhyBonds } from "./WhyBonds.styled"

export const WhyBonds = () => {
  const { t } = useTranslation()

  return (
    <SWhyBonds>
      <Text color="white" fs={20} fw={600}>
        {t("bonds.whyBonds.title")}
      </Text>
      <Text color="darkBlue200" sx={{ mt: 16 }}>
        {t("bonds.whyBonds.desc")}
      </Text>
      <div sx={{ mt: 41, flex: "row", gap: 20 }}>
        {whyBonds.map((whyBond, i) => (
          <Step
            key={whyBond.index}
            icon={<Icon icon={whyBond.icon} />}
            title={t(`bonds.whyBonds.${whyBond.index}.title`)}
            description={t(`bonds.whyBonds.${whyBond.index}.desc`)}
          />
        ))}
      </div>
      <Text
        color="brightBlue300"
        fs={12}
        sx={{ mt: 30 }}
        css={{
          borderBottom: `1px solid ${theme.colors.brightBlue300}`,
          display: "inline-block",
        }}
      >
        <a href="https://hydradx.io" target="_blank" rel="noreferrer">
          {t("bonds.whyBonds.link")}
          <LinkIcon height={10} sx={{ ml: 6 }} />
        </a>
      </Text>
    </SWhyBonds>
  )
}
