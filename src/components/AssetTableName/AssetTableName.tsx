import { useTranslation } from "react-i18next"
import { SIcon } from "sections/wallet/assets/table/data/WalletAssetsTableData.styled"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useRpcProvider } from "providers/rpcProvider"

export const AssetTableName = ({
  large,
  symbol,
  name,
  isPaymentFee,
  id,
}: {
  symbol: string
  name: string
  large?: boolean
  isPaymentFee?: boolean
  id: string
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(id)

  const iconIds = assets.isStableSwap(asset) ? asset.assets : asset.id

  return (
    <div>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        {typeof iconIds === "string" ? (
          <SIcon large={large}>
            <AssetLogo id={iconIds} />
          </SIcon>
        ) : (
          <MultipleIcons
            icons={iconIds.map((asset) => ({
              icon: (
                <SIcon large={large}>
                  <AssetLogo id={asset} />
                </SIcon>
              ),
            }))}
          />
        )}

        <div sx={{ flex: "column", width: "100%", gap: [0, 4] }}>
          <Text
            fs={[large ? 18 : 14, 16]}
            lh={[large ? 16 : 23, 16]}
            fw={700}
            color="white"
          >
            {symbol}
          </Text>
          <Text
            fs={[large ? 13 : 12, 13]}
            lh={[large ? 17 : 14, 13]}
            fw={500}
            css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.61)` }}
          >
            {name}
          </Text>
        </div>
      </div>
      {isPaymentFee && (
        <Text
          fs={9}
          fw={700}
          sx={{
            mt: 4,
            ml: large ? 50 : [32, 40],
          }}
          color="brightBlue300"
          tTransform="uppercase"
        >
          {t("wallet.assets.table.details.feePaymentAsset")}
        </Text>
      )}
    </div>
  )
}
