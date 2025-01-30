import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import {
  SAssetSelect,
  SAssetSelectItem,
} from "sections/deposit/components/AssetSelect.styled"
import { AssetConfig } from "sections/deposit/types"

export type AssetSelectProps = {
  assets: AssetConfig[]
  onSelect: (asset: AssetConfig) => void
}

export const AssetSelect: React.FC<AssetSelectProps> = ({
  assets,
  onSelect,
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  return (
    <SAssetSelect>
      <Text
        sx={{ ml: 12 }}
        fs={11}
        color="basic700"
        font="GeistMedium"
        tTransform="uppercase"
      >
        {t("selectAssets.asset")}
      </Text>
      {assets.map((asset) => {
        const { assetId } = asset
        const { symbol, id, name } = getAsset(assetId.toString()) ?? {}

        return (
          <SAssetSelectItem key={id} onClick={() => onSelect(asset)}>
            <Icon size={26} icon={<AssetLogo id={id} />} />
            <div>
              <Text fs={14} font="GeistSemiBold">
                {symbol}
              </Text>
              <Text fs={11} color="whiteish500">
                {name}
              </Text>
            </div>
          </SAssetSelectItem>
        )
      })}
    </SAssetSelect>
  )
}
