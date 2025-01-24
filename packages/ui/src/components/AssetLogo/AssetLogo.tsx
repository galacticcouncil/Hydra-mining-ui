import { PlaceholderAssetLogo, TriangleAlert } from "@/assets/icons"
import { Box, Tooltip } from "@/components"

import {
  IconsWrapper,
  SAssetBadge,
  SAssetLogo,
  SBadgeSlot,
  SChainLogo,
  SPlaceholder,
} from "./AssetLogo.styled"

export type AssetLogoSize = "large" | "medium" | "small"
export type TBadge = "red" | "yellow"

export type AssetLogoProps = {
  src?: string
  chainSrc?: string
  alt?: string
  size?: AssetLogoSize
  badge?: TBadge
  badgeTooltip?: string
}

export const AssetLogo = ({
  src,
  size = "medium",
  alt,
  chainSrc,
  badge,
  badgeTooltip,
}: AssetLogoProps) => {
  if (!src) return <SPlaceholder component={PlaceholderAssetLogo} size={size} />

  return (
    <Box sx={{ position: "relative", width: "fit-content", flexShrink: 0 }}>
      <SAssetLogo
        loading="lazy"
        src={src}
        alt={alt}
        withChainLogo={!!chainSrc}
        size={size}
      />
      {chainSrc && <SChainLogo loading="lazy" src={chainSrc} />}

      {badge && <Badge badge={badge} tooltip={badgeTooltip} />}
    </Box>
  )
}

export const MultipleAssetLogoWrapper = ({
  size,
  children,
}: {
  size: AssetLogoSize
  children: React.ReactNode
}) => {
  return <IconsWrapper size={size}>{children}</IconsWrapper>
}

const Badge = ({ badge, tooltip }: { badge: TBadge; tooltip?: string }) => {
  const BadgeComp = (
    <SAssetBadge component={TriangleAlert} size="100%" type={badge} />
  )

  return (
    <SBadgeSlot>
      {tooltip ? <Tooltip text={tooltip}>{BadgeComp}</Tooltip> : BadgeComp}
    </SBadgeSlot>
  )
}
