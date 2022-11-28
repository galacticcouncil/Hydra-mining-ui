import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { BASILISK_ADDRESS_PREFIX, NATIVE_ASSET_ID } from "utils/api"
import { useTokenBalance } from "api/balances"
import { SSelectItem } from "./WalletConnectAccountSelectItem.styled"
import { WalletConnectAccountSelectAddress } from "sections/wallet/connect/accountSelect/item/address/WalletConnectAccountSelectAddress"
import { FC } from "react"
import { useAssetMeta } from "api/assetMeta"

type Props = {
  isActive: boolean
  address: string
  name: string
  provider: string
  setAccount: () => void
}

export const WalletConnectAccountSelectItem: FC<Props> = ({
  isActive,
  address,
  name,
  provider,
  setAccount,
}) => {
  const basiliskAddress = encodeAddress(
    decodeAddress(address),
    BASILISK_ADDRESS_PREFIX,
  )
  const kusamaAddress = address
  const { data } = useTokenBalance(NATIVE_ASSET_ID, kusamaAddress)
  const { data: meta } = useAssetMeta(NATIVE_ASSET_ID)

  const { t } = useTranslation()

  return (
    <SSelectItem isActive={isActive} onClick={setAccount}>
      <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
        <Text font="ChakraPetchBold">{name}</Text>
        <div sx={{ flex: "row", align: "end", gap: 2 }}>
          <Text>
            {t("value.native", {
              value: data?.balance,
              fixedPointScale: meta?.decimals,
              decimalPlaces: 4,
            })}
          </Text>
          <Text fs={14} font="ChakraPetchBold" tTransform="uppercase">
            {meta?.symbol}
          </Text>
        </div>
      </div>

      <div sx={{ flex: "column", mt: 12, gap: 12 }}>
        <WalletConnectAccountSelectAddress
          name={t("walletConnect.accountSelect.asset.network")}
          address={basiliskAddress}
          theme="substrate"
        />
        <Separator color="basic700" opacity={isActive ? 0.3 : 1} />
        <WalletConnectAccountSelectAddress
          name={t("walletConnect.accountSelect.asset.parachain")}
          address={kusamaAddress}
          theme={provider}
        />
      </div>
    </SSelectItem>
  )
}
