import { PixelArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Box, BoxProps, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link, LinkProps } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

import { SDetailedLink } from "./DetailedLink.styled"

type DetailedLinkOwnProps = {
  to: string | keyof typeof LINKS
  title: string
  description?: string
  icon?: React.ComponentType
}

export type DetailedLinkProps = BoxProps &
  DetailedLinkOwnProps &
  Omit<LinkProps, "to">

export const DetailedLink: React.FC<DetailedLinkProps> = ({
  to,
  title,
  description,
  icon: IconComponent,
  ...props
}) => (
  <SDetailedLink asChild {...props}>
    <Link to={to}>
      {IconComponent && (
        <Icon size={20} component={IconComponent} color="skyBlue.500" />
      )}
      <Box>
        <Text fw={600} fs={13}>
          {title}
        </Text>
        {description && (
          <Text fs={12} color={getToken("text.low")}>
            {description}
          </Text>
        )}
      </Box>
      <Icon
        size={20}
        component={PixelArrowRight}
        sx={{ opacity: 0.2 }}
        ml="auto"
      />
    </Link>
  </SDetailedLink>
)
