import { Text } from "components/Typography/Text/Text"

export const PieChartLabel = () => {
  // const { t } = useTranslation()

  return (
    <>
      {/*<Text fs={12}>{t("staking.dashboard.stats.chart.label")}</Text>*/}
      <Text fs={12}>status:</Text>
      <Text fs={20} font="FontOver">
        BURNING
      </Text>
    </>
  )
}
