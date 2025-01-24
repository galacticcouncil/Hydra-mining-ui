import { keyframes } from "@emotion/react"
import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { ThemeColor } from "@galacticcouncil/ui/theme"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { RpcInfoResult } from "@/utils/rpc"

export type RpcStatusProps = Partial<RpcInfoResult> & { ping?: number }

const CIRC = Math.ceil(2 * Math.PI * 5)
const animateCircle = keyframes`
  0% {
    opacity: 1;
    stroke-dashoffset: ${CIRC};
  }

  60% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
  
  100% {
    opacity: 0;
    stroke-dashoffset: 0;
  }
`

export const RpcStatusSuccess = () => {
  return (
    <span sx={{ position: "relative", size: 7 }}>
      <span
        sx={{
          position: "absolute",
          size: 7,
          display: "block",
          background: "currentColor",
          borderRadius: "9999px",
        }}
      />
      <svg
        width="7"
        height="7"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000.svg?react"
        sx={{
          top: 0,
          scale: 1.6,
          left: 0,
          transform: "rotate(-90deg)",
        }}
      >
        <circle
          cx="5.5"
          cy="5.5"
          r="5"
          stroke="currentColor"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
          sx={{ animation: `${animateCircle} 1s linear forwards` }}
        />
      </svg>
    </span>
  )
}

export const RpcStatusSlow = () => (
  <CaretDown sx={{ size: 7, transform: "rotate(180deg)", scale: 1.3 }} />
)

export const RpcStatusOffline = () => (
  <span
    sx={{ size: 7, display: "block" }}
    css={{ background: `currentColor` }}
  />
)

const rpcStatusTextMap = {
  // t("rpc.status.online")
  online: "rpc.status.online",
  // t("rpc.status.slow")
  slow: "rpc.status.slow",
  // t("rpc.status.offline")
  offline: "rpc.status.offline",
} as const

export const RpcStatus: React.FC<RpcStatusProps> = ({
  timestamp,
  blockNumber,
  ping = Infinity,
}) => {
  const { t } = useTranslation()

  const status = useElapsedTimeStatus(timestamp ?? 0)

  const statusText = status ? t(rpcStatusTextMap[status]) : ""

  const statusColor: ThemeColor =
    status === "online"
      ? "successGreen.400"
      : status === "slow"
        ? "utility.warningPrimary.400"
        : "utility.red.400"

  return (
    <Box>
      <Tooltip text={statusText} side="left" asChild>
        <Flex align="center" gap={4} color={statusColor}>
          <Text fs={12}>{blockNumber}</Text>
          {status === "online" && <RpcStatusSuccess key={timestamp} />}
          {status === "slow" && <RpcStatusSlow />}
          {status === "offline" && <RpcStatusOffline />}
        </Flex>
      </Tooltip>
      {ping < Infinity && <RpcPingAverage ping={ping} />}
    </Box>
  )
}

const RpcPingAverage: React.FC<{ ping: number }> = ({ ping }) => {
  const avgPingArrRef = useRef<number[]>([])

  useEffect(() => {
    if (ping < Infinity) {
      avgPingArrRef.current = [...avgPingArrRef.current, ping].slice(-10)
    }
  }, [ping])

  const avgPing =
    avgPingArrRef.current.length === 0
      ? ping
      : avgPingArrRef.current.reduce((acc, curr) => acc + curr, 0) /
        avgPingArrRef.current.length

  const pingColor: ThemeColor =
    avgPing < 250
      ? "successGreen.400"
      : avgPing < 500
        ? "utility.warningPrimary.400"
        : "utility.red.400"

  return (
    <Text fs={10} mt={2} color={pingColor}>
      {Math.round(avgPing)} ms
    </Text>
  )
}
