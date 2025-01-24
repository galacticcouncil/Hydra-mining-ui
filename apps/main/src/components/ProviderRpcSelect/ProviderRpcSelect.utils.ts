import { useState } from "react"
import { useInterval } from "react-use"

export const useElapsedTimeStatus = (timestamp: number | null) => {
  const [now, setNow] = useState(Date.now())

  useInterval(() => {
    setNow(Date.now())
  }, 1000)

  if (timestamp === null) return "offline"

  const diff = now - timestamp

  // Instead of 24s (usual target), use 32s to not show warnings all the time
  if (diff < 32_000) return "online" as const
  if (diff < 120_000) return "slow" as const
  return "offline"
}
