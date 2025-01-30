import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SRowNumber } from "sections/deposit/components/CexDepositGuide.styled"

const GUIDE_ROWS = [
  {
    title: "deposit.guide.step1.title",
    description: "deposit.guide.step1.description",
  },
  {
    title: "deposit.guide.step2.title",
    description: "deposit.guide.step2.description",
  },
  {
    title: "deposit.guide.step3.title",
    description: "deposit.guide.step3.description",
  },
  {
    title: "deposit.guide.step4.title",
    description: "deposit.guide.step4.description",
  },
  {
    title: "deposit.guide.step5.title",
    description: "deposit.guide.step5.description",
  },
] as const

export const CexDepositGuide = () => {
  const { t } = useTranslation()
  return (
    <div>
      <GradientText gradient="pinkLightBlue" fs={18} sx={{ mb: 12 }}>
        {t("deposit.guide.title")}
      </GradientText>
      <div sx={{ flex: "column", gap: 20 }}>
        {GUIDE_ROWS.map(({ title, description }, index) => (
          <CexDepositGuideRow
            key={title}
            step={index + 1}
            title={t(title)}
            description={t(description)}
          />
        ))}
      </div>
    </div>
  )
}

const CexDepositGuideRow: React.FC<{
  step: number
  title: string
  description: string
}> = ({ step, title, description }) => {
  return (
    <div sx={{ flex: "row", gap: 20 }}>
      <SRowNumber>{step}</SRowNumber>
      <div>
        <Text fs={14} sx={{ mb: 2 }}>
          {title}
        </Text>
        <Text fs={12} color="darkBlue200">
          {description}
        </Text>
      </div>
    </div>
  )
}
