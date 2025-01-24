import { ThemeUICSSProperties } from "@theme-ui/core"
import { forwardRef } from "react"

import { Box, BoxProps } from "@/components/Box"

export type FlexOwnProps = {
  inline?: boolean
  wrap?: boolean
  gap?: ThemeUICSSProperties["gap"]
  direction?: ThemeUICSSProperties["flexDirection"]
  align?: ThemeUICSSProperties["alignItems"]
  justify?: ThemeUICSSProperties["justifyContent"]
}

export type FlexProps = FlexOwnProps & BoxProps

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      direction,
      align,
      justify,
      inline,
      wrap,
      css,
      sx,
      gap,
      ...rest
    }: FlexProps,
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        css={css}
        display={inline ? "inline-flex" : "flex"}
        sx={{
          gap,
          flexWrap: wrap ? "wrap" : undefined,
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          ...sx,
        }}
        {...rest}
      />
    )
  },
)

Flex.displayName = "Flex"
