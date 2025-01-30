import { keys } from "utils/helpers"
import { css } from "@emotion/react"

const colors = {
  white: "#ffffff",
  black: "#000000",
  pink100: "#FFBBD6",
  pink200: "#FEA6CA",
  pink300: "#FF99C2",
  pink400: "#FF8BBA",
  pink500: "#FF67A4",
  pink600: "#FC408C",
  pink700: "#E53E76",
  pink400Alpha: "#FF0369",
  paleBlue: "#DDE5FF",
  brightBlue100: "#A6DDFF",
  brightBlue200: "#9CDDFF",
  brightBlue200Alpha: "#01A8FF",
  brightBlue300: "#AAEEFC",
  brightBlue400: "#3192CD",
  brightBlue500: "#1A7AB4",
  brightBlue600: "#57B3EB",
  brightBlue700: "#53A4F3",
  vibrantBlue100: "#7889FF",
  vibrantBlue200: "#5F73FE",
  vibrantBlue300: "#485EF8",
  vibrantBlue400: "#2B40C8",
  vibrantBlue500: "#152DC7",
  vibrantBlue600: "#0A1FA7",
  vibrantBlue700: "#031586",
  darkBlue100: "#CCCDD3",
  darkBlue200: "#999BA7",
  darkBlue300: "#66697C",
  darkBlue400: "#333750",
  darkBlue401: "#1C2038",
  darkBlue500: "#000524",
  darkBlue600: "#00041D",
  darkBlue700: "#111320",
  darkBlue800: "#00020E",
  darkBlue801: "#0A0C17",
  darkBlue900: "#000107",
  darkBlue1000: "#000524",
  basic100: "#ECEDEF",
  basic200: "#D4D6DF",
  basic300: "#BBBEC9",
  basic400: "#B2B6C5",
  basic500: "#878C9E",
  basic600: "#676C80",
  basic700: "#5D6175",
  basic750: "#444559",
  basic800: "#26282F",
  basic900: "#00041D",
  basic1000: "#1C1A1F",
  warning100: "#FFE2C3",
  warning200: "#FFDF38",
  warning300: "#F5A855",
  warningOrange200: "#FBCD9C",
  error: "#FF8A8A",
  red100: "#EF0303",
  red300: "#FF9E9E",
  redA300: "#FF0606",
  red400: "#F87171",
  red500: "#FF4B4B",
  red700: "#FF0000",
  green100: "#03EF97",
  green400: "#01F397",
  green500: "#4BFFBB",
  green600: "#30FFB1",
  green700: "#00FFA0",
  warningYellow200: "#F4E7B0",
  warningYellow300: "#F0DA73",
  warningYellow400: "#F7BF06",
  alarmRed400: "#FF6868",
  iconGray: "#BDCCD4",
  neutralGray100: "#E5ECF1",
  neutralGray500: "#787E82",
  gray: "#0A0C16",
  graySoft: "#EBEBEB",
  whiteish500: "#878C9E",
  alpha0: "#9EA7BA",
  primaryA0: "#546380",
  primaryA15: "#4CD5F3",
  primaryA20: "#25CBFF",
  primaryA35: "#2FD3F7",
  primaryA06: "#DAFFEE",
  primaryA15Blue: "#546380",
  graphGradient0: "#FC408C",
  graphGradient100: "#57B3EB",
  bg: "#060917",
} as const

const gradients = {
  background:
    "linear-gradient(180deg, #004596 0%, rgba(4, 56, 117, 0.00) 100%)",
  backgroundStats: `
    radial-gradient(
      59.04% 80.58% at 114.9% 36.2%,
      rgba(246, 42, 125, 0.59) 0.48%,
      rgba(246, 42, 125, 0.34) 25%,
      rgba(6, 9, 23, 0) 80%
    ),
    radial-gradient(
      56.41% 76.99% at -12.28% 29.31%,
      #00579f 0.48%,
      #023b6a 25%,
      rgba(6, 9, 23, 0) 80%
    ),
    #060917;
  `,
  pink: "linear-gradient(90deg, #FC408C 0%, #15161C 100%)",
  lightBlue: "linear-gradient(90deg, #57B3EB 0%, #15161C 100%)",
  darkBlue: "linear-gradient(90deg, #0A1FA7 0%, #15161C 100%)",
  darkBlueLight: "linear-gradient(90deg, #0A1FA7 0%, #57B3EB 100%)",
  pinkLightBlue: "linear-gradient(90deg, #FC408C 0%, #AAEEFC 100%)",
  pinkLightPink: "linear-gradient(90deg, #FC408C 30%, #EFB0FF 100%)",
  pinkDarkPink:
    "linear-gradient(90deg, #532051 0%, #AE2569 55.72%, #F6297C 100%)",
  spinner:
    "conic-gradient(from -60.84deg at 50% 50%, rgba(10, 13, 26, 0) 0deg, rgba(10, 13, 26, 0) 134.49deg, #00C2FF 185.07deg, #004DE2 243.24deg, #FC408C 294.78deg, #FC408C 358.13deg, rgba(10, 13, 26, 0) 360deg)",
  lightGreenOrange:
    "linear-gradient(90deg, #4FFFB0 1.27%, #B3FF8F 93.06%, #FF984E 199.27%)",
} as const

const shadows = {
  boxShadow: "3px 3px 0px rgba(199, 199, 199, 0.27)",
  boxShadowTable:
    "0px 10px 30px rgba(91, 144, 172, 0.12), 3px 3px 0px rgba(126, 161, 194, 0.12)",
  internalBox: "4px 4px 0px rgba(102,181,255,0.19)",
  internalBoxSecondary: "4px 4px 0px rgba(102,181,255,0.19)",
  internalBoxDark: "4px 4px 0px #0A0C17;",
  modal: "3px 4px 0px rgba(102, 181, 255, 0.19)",
  contentBox: `3px 4px 0px rgba(102, 181, 255, 0.19);`,
} as const

const zIndices = {
  chainedIcon: 1,
  boxSwitch: 1,
  header: 5,
  backdrop: 9,
  tablePlaceholder: 4,
  modal: 10,
  toast: 11,
} as const

const breakpoints = {
  xs: 480,
  sm: 768,
  md: 1200, //value represents navigation bar for tablet
  lg: 1440,
  xl: 1536,
} as const
type BreakpointKey = keyof typeof breakpoints

const mediaGte = <Key extends BreakpointKey>(key: Key) =>
  `(min-width: ${breakpoints[key]}px)` as const
const mediaLt = <Key extends BreakpointKey>(key: Key) =>
  `(max-width: calc(${breakpoints[key]}px - 1px))` as const

const viewport = {
  gte: Object.fromEntries(keys(breakpoints).map((i) => [i, mediaGte(i)])) as {
    [Key in BreakpointKey]: ReturnType<typeof mediaGte<Key>>
  },
  lt: Object.fromEntries(keys(breakpoints).map((i) => [i, mediaLt(i)])) as {
    [Key in BreakpointKey]: ReturnType<typeof mediaLt<Key>>
  },
} as const

// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const tmp = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(tmp)
  return [
    parseInt(result![1], 16),
    parseInt(result![2], 16),
    parseInt(result![3], 16),
  ].join(",")
}

const rgbColors = Object.fromEntries(
  keys(colors).map((i) => [i, hexToRgb(colors[i])]),
) as {
  [Key in keyof typeof colors]: string
}

const transitions = {
  slow: "0.30s ease-in-out",
  default: "0.15s ease-in-out",
} as const

const borderRadius = {
  medium: 8,
  default: 4,
} as const

export const gradientBorder = css`
  position: relative;
  border-radius: ${borderRadius.default}px;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: ${borderRadius.default}px;
    padding: 1px;

    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.27) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
      rgba(158, 167, 180, 0.2) 100%
    );

    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`

export const scrollbarHidden = css`
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
  &::-webkit-scrollbar,
  &::-webkit-scrollbar-thumb {
    display: none;
  }
`

export const theme = {
  colors,
  gradients,
  rgbColors,
  transitions,
  zIndices,
  viewport,
  shadows,
  borderRadius,
  gradientBorder,
  scrollbarHidden,
}
