import { Interpolation } from "@emotion/react"
import { Slot } from "@radix-ui/react-slot"
import { Theme } from "@theme-ui/core"
import { ThemeUICSSProperties, ThemeUIStyleObject } from "@theme-ui/css"
import React, { forwardRef } from "react"

import { ThemeColor } from "@/theme"

export type BoxOwnProps = {
  asChild?: boolean
  as?: React.ElementType
  css?: Interpolation<unknown>
  sx?: ThemeUIStyleObject<Theme>
  children?: React.ReactNode
  m?: ThemeUICSSProperties["m"]
  mt?: ThemeUICSSProperties["mt"]
  mr?: ThemeUICSSProperties["mr"]
  mb?: ThemeUICSSProperties["mb"]
  ml?: ThemeUICSSProperties["ml"]
  mx?: ThemeUICSSProperties["mx"]
  my?: ThemeUICSSProperties["my"]
  p?: ThemeUICSSProperties["p"]
  pt?: ThemeUICSSProperties["pt"]
  pr?: ThemeUICSSProperties["pr"]
  pb?: ThemeUICSSProperties["pb"]
  pl?: ThemeUICSSProperties["pl"]
  px?: ThemeUICSSProperties["px"]
  py?: ThemeUICSSProperties["py"]
  display?: ThemeUICSSProperties["display"]
  color?: ThemeColor | ThemeUICSSProperties["color"]
  bg?: ThemeColor | ThemeUICSSProperties["backgroundColor"]
  width?: ThemeUICSSProperties["width"]
  height?: ThemeUICSSProperties["height"]
  maxWidth?: ThemeUICSSProperties["maxWidth"]
  maxHeight?: ThemeUICSSProperties["maxHeight"]
  size?: ThemeUICSSProperties["size"]
  borderRadius?: ThemeUICSSProperties["borderRadius"]
}

export type BoxProps = BoxOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, "color">

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      css,
      sx,
      as: Component = "div",
      asChild = false,
      m,
      mt,
      mr,
      mb,
      ml,
      mx,
      my,
      p,
      pt,
      pr,
      pb,
      pl,
      px,
      py,
      display,
      color,
      bg,
      width,
      height,
      maxWidth,
      maxHeight,
      size,
      borderRadius,
      ...rest
    },
    ref,
  ) => {
    const SlottedComponent = asChild ? Slot : Component

    const fullSx = {
      ...sx,
      m,
      mt,
      mr,
      mb,
      ml,
      mx,
      my,
      p,
      pt,
      pr,
      pb,
      pl,
      px,
      py,
      display,
      color,
      bg,
      width,
      height,
      maxWidth,
      maxHeight,
      size,
      borderRadius,
    }

    return <SlottedComponent ref={ref} sx={fullSx} css={css} {...rest} />
  },
)

Box.displayName = "Box"
