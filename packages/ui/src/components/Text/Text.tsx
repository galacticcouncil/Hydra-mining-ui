import { ResponsiveStyleValue } from "@theme-ui/core"
import React, { forwardRef } from "react"

import { Box, BoxProps } from "@/components"
import { ThemeFont } from "@/theme"
import { getToken } from "@/utils"

export type TextProps = BoxProps & {
  as?: React.ElementType
  children: React.ReactNode
  fw?: ResponsiveStyleValue<400 | 500 | 600>
  fs?: ResponsiveStyleValue<string | number>
  font?: ThemeFont
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ as = "p", fs, fw, font = "secondary", ...props }, ref) => {
    return (
      <Box
        as={as}
        ref={ref}
        sx={{
          fontFamily: getToken(`fontFamilies1.${font}`),
          fontSize: fs,
          fontWeight: fw,
        }}
        {...props}
      />
    )
  },
)

Text.displayName = "Text"
