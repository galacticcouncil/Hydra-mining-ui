import { ThemeUICSSProperties } from "@theme-ui/css"
import { LoaderCircle } from "lucide-react"

import { getToken } from "@/utils"

export type SpinnerProps = React.ComponentProps<"svg"> & {
  size?: ThemeUICSSProperties["size"]
}

export const Spinner: React.FC<SpinnerProps> = ({ size, ...props }) => {
  return (
    <LoaderCircle
      {...props}
      sx={{
        size,
        animationName: getToken("animations.rotate"),
        animationDuration: "0.8s",
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
      }}
    />
  )
}
