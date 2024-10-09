import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { Link } from "sections/lending/components/primitives/Link"
import { frozenProposalMap } from "sections/lending/utils/marketsAndNetworksConfig"

interface FrozenTooltipProps {
  symbol?: string
  currentMarket?: string
}

export const getFrozenProposalLink = (
  symbol: string | undefined,
  currentMarket: string | undefined,
): string => {
  if (currentMarket && currentMarket === "proto_harmony_v3") {
    return "https://snapshot.org/#/aave.eth/proposal/0x81a78109941e5e0ac6cb5ebf82597c839c20ad6821a8c3ff063dba39032533d4"
  } else if (currentMarket && currentMarket === "proto_fantom_v3") {
    return "https://snapshot.org/#/aave.eth/proposal/0xeefcd76e523391a14cfd0a79b531ea0a3faf0eb4a058e255fac13a2d224cc647"
  } else if (
    symbol &&
    frozenProposalMap[symbol.toUpperCase() + currentMarket]
  ) {
    return frozenProposalMap[symbol.toUpperCase() + currentMarket]
  } else {
    return "https://app.aave.com/governance"
  }
}

export const FrozenTooltip = ({
  symbol,
  currentMarket,
}: FrozenTooltipProps) => {
  return (
    <InfoTooltip
      text={
        <Text>
          This asset is frozen due to an Aave Protocol Governance decision.{" "}
          <Link
            href={getFrozenProposalLink(symbol, currentMarket)}
            sx={{ textDecoration: "underline" }}
          >
            <span>More details</span>
          </Link>
        </Text>
      }
    ></InfoTooltip>
  )
}
