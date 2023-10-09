import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { useTokenBalance } from "api/balances"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import { WalletConnectAccountSelectAddress } from "sections/wallet/connect/accountSelect/item/address/WalletConnectAccountSelectAddress"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { SSelectItem } from "./WalletConnectAccountSelectItem.styled"
import { useRpcProvider } from "providers/rpcProvider"
import Skeleton from "react-loading-skeleton"

type Props = {
  isActive: boolean
  address: string
  name: string
  provider: string
  onClick?: () => void
  isProxy?: boolean
}

export const WalletConnectAccountSelectItem: FC<Props> = ({
  isActive,
  address,
  name,
  provider,
  onClick,
  isProxy,
}) => {
  const isHydraAddress = address[0] === "7"
  const hydraAddress = isHydraAddress
    ? address
    : encodeAddress(decodeAddress(address), HYDRA_ADDRESS_PREFIX)

  const polkadotAddress = isHydraAddress
    ? encodeAddress(decodeAddress(address))
    : address

  const {
    isLoaded,
    assets: { native },
  } = useRpcProvider()
  const { data } = useTokenBalance(native?.id, polkadotAddress)

  const { t } = useTranslation()

  return (
    <SSelectItem isActive={isActive} isProxy={!!isProxy} onClick={onClick}>
      <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
        <Text font="ChakraPetchBold">{name}</Text>
        {isLoaded ? (
          <div sx={{ flex: "row", align: "end", gap: 2 }}>
            <Text color="basic200" fw={400}>
              {t("value.token", {
                value: data?.balance,
                fixedPointScale: native?.decimals,
                type: "token",
              })}
            </Text>
            <Text color="graySoft" tTransform="uppercase">
              {native?.symbol}
            </Text>
          </div>
        ) : (
          <Skeleton width={70} height={20} />
        )}
      </div>

      {isProxy && (
        <>
          <Separator sx={{ my: 14 }} />
          <div>
            <Trans t={t} i18nKey="walletConnect.accountSelect.proxyAccount">
              <Text
                color="pink500"
                fs={14}
                font="ChakraPetchBold"
                css={{ display: "inline-block" }}
              />
              <Text color="pink500" fs={14} css={{ display: "inline-block" }} />
            </Trans>
          </div>
        </>
      )}
      <div sx={{ flex: "column", mt: 12, gap: 12 }}>
        <WalletConnectAccountSelectAddress
          name={t("walletConnect.accountSelect.asset.network")}
          address={hydraAddress}
          theme="substrate"
          isProxy={isProxy}
        />
        {!isProxy && (
          <>
            <Separator
              opacity={isActive ? 0.3 : 1}
              css={{ background: "var(--secondary-color)" }}
            />
            <WalletConnectAccountSelectAddress
              name={t("walletConnect.accountSelect.substrate.address")}
              address={polkadotAddress}
              theme={provider}
            />
          </>
        )}
      </div>
    </SSelectItem>
  )
}
