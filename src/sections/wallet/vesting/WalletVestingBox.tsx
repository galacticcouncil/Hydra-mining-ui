import { SBox, SMobBackground } from "./WalletVestingBox.styled"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { WalletVestingSchedule } from "./WalletVestingSchedule"
import { WalletVestingEmpty } from "./WalletVestingEmpty"
import { useVestingSchedules } from "../../../api/vesting"
import { useAccountStore } from "../../../state/store"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"

const VestingBoxContent = () => {
  const { account } = useAccountStore()
  const { data, isLoading } = useVestingSchedules(account?.address)

  if (isLoading) {
    return (
      <div
        sx={{ flex: "row", align: "center", justify: "center", height: 240 }}
      >
        <Spinner width={50} height={50} />
      </div>
    )
  }

  if (data) {
    return !!data.length ? <WalletVestingSchedule /> : <WalletVestingEmpty />
  }

  return <WalletVestingEmpty />
}

export const WalletVestingBox = () => {
  const { t } = useTranslation()
  const api = useApiPromise()

  return (
    <div sx={{ flex: "column", flexGrow: 1 }}>
      <SBox>
        <Heading
          fs={[15, 19]}
          fw={500}
          sx={{
            ml: 10,
          }}
        >
          {t("wallet.vesting.your_vesting")}
        </Heading>
        {isApiLoaded(api) ? <VestingBoxContent /> : <WalletVestingEmpty />}
      </SBox>
      <SMobBackground />
    </div>
  )
}
