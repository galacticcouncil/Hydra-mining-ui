import * as React from "react"
import { createComponent } from "@lit-labs/react"
import {
  AssetId,
  AssetBadge,
  ChainLogo as ChainLogoUi,
  PlaceholderLogo,
} from "@galacticcouncil/ui"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { assetPlaceholderCss } from "./AssetIcon.styled"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AnyParachain } from "@galacticcouncil/xcm-core"
import { isAnyParachain } from "utils/helpers"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Icon } from "components/Icon/Icon"
import { ResponsiveValue } from "utils/responsive"
import { useAssets } from "providers/assets"
import { useExternalAssetsWhiteList } from "api/external"

const chains = Array.from(chainsMap.values())

export const UigcAssetPlaceholder = createComponent({
  tagName: "uigc-logo-placeholder",
  elementClass: PlaceholderLogo,
  react: React,
})

export const UigcAssetId = createComponent({
  tagName: "uigc-asset-id",
  elementClass: AssetId,
  react: React,
})

export const UigcAssetBadge = createComponent({
  tagName: "uigc-asset-badge",
  elementClass: AssetBadge,
  react: React,
})

export const UigcChainLogo = createComponent({
  tagName: "uigc-logo-chain",
  elementClass: ChainLogoUi,
  react: React,
})

export const MultipleAssetLogo = ({
  iconId,
  size = 26,
}: {
  iconId: string | string[] | undefined
  size?: ResponsiveValue<number>
}) => {
  const { getAssetWithFallback } = useAssets()
  if (!iconId) return <Icon size={size} icon={<AssetLogo id={iconId} />} />
  const allIconIds = Array.isArray(iconId)
    ? iconId
        .map((id) => {
          const { iconId } = getAssetWithFallback(id)

          return iconId
        })
        .flat()
    : iconId
  return typeof allIconIds === "string" ? (
    <Icon size={size} icon={<AssetLogo id={allIconIds} />} />
  ) : (
    <MultipleIcons
      size={size}
      icons={allIconIds.map((id) => ({
        icon: <AssetLogo key={id} id={id} />,
      }))}
    />
  )
}

export const AssetLogo = ({ id }: { id?: string }) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()

  const { getIsWhiteListed } = useExternalAssetsWhiteList()

  const asset = useMemo(() => {
    const assetDetails = id ? getAsset(id) : undefined

    const chain = chains.find(
      (chain) =>
        isAnyParachain(chain) &&
        chain.parachainId === Number(assetDetails?.parachainId),
    ) as AnyParachain

    const { badge } = getIsWhiteListed(assetDetails?.id ?? "")

    return {
      chain: chain?.key,
      symbol: assetDetails?.symbol,
      badgeVariant: badge,
    }
  }, [getAsset, getIsWhiteListed, id])

  if (asset.chain || asset.symbol)
    return (
      <UigcAssetId
        css={{ "& uigc-logo-chain": { display: "none" } }}
        ref={(el) => {
          el && asset.chain && el.setAttribute("chain", asset.chain)
          el && el.setAttribute("fit", "")
        }}
        symbol={asset.symbol}
        chain={asset?.chain}
      >
        {asset.badgeVariant && (
          <UigcAssetBadge
            slot="badge"
            variant={asset.badgeVariant}
            text={t(`wallet.addToken.tooltip.${asset.badgeVariant}`)}
          />
        )}
      </UigcAssetId>
    )

  return (
    <UigcAssetPlaceholder
      css={assetPlaceholderCss}
      ref={(el) => el && el.setAttribute("fit", "")}
      slot="placeholder"
    />
  )
}

export const ChainLogo = ({ symbol }: { symbol?: string }) => {
  return (
    <UigcChainLogo
      chain={symbol}
      ref={(el) => el && el.setAttribute("fit", "")}
    >
      <UigcAssetPlaceholder
        css={assetPlaceholderCss}
        ref={(el) => el && el.setAttribute("fit", "")}
        slot="placeholder"
      />
    </UigcChainLogo>
  )
}
