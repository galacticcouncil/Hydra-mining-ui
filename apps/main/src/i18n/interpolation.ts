import { format as formatDate, isDate } from "date-fns"
import { FormatFunction } from "i18next"

const NB_SPACE = String.fromCharCode(160) // non-breaking space

const formatNumberParts = (part: Intl.NumberFormatPart) => {
  if (part.type === "group") {
    return NB_SPACE
  }
  return part.value
}

const getMaxSignificantDigits = (
  value: number | bigint,
  options: Intl.NumberFormatOptions,
) => {
  if (options.notation === "compact") {
    return
  }

  let maxDigits = 4

  if (value > 1) {
    const intPartLen = Math.ceil(Math.log10(Number(value) + 1))
    maxDigits = (value > 99999.9999 ? 0 : value > 999.9999 ? 2 : 4) + intPartLen
  }

  return maxDigits
}

const formatters = {
  number: (
    value: number | bigint,
    lng?: string,
    options: Record<string, unknown> = {},
  ) => {
    return new Intl.NumberFormat(lng, {
      maximumSignificantDigits: getMaxSignificantDigits(value, options),
      ...options,
    })
      .formatToParts(value)
      .map(formatNumberParts)
      .join("")
  },

  currency: (
    value: number | bigint,
    lng?: string,
    options: Record<string, unknown> = {},
  ) => {
    let parts = Intl.NumberFormat(lng, {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits: getMaxSignificantDigits(value, options),
      ...options,
    }).formatToParts(value)

    if (options.symbol) {
      parts = [
        ...parts.slice(1),
        { type: "literal", value: NB_SPACE },
        { type: "currency", value: options.symbol } as Intl.NumberFormatPart,
      ]
    }

    return parts.map(formatNumberParts).join("")
  },

  date: (value: Date | number, options: Record<string, string> = {}) => {
    const date = new Date(value)
    if (!isDate(date)) {
      return ""
    }

    try {
      return formatDate(date, options.format)
    } catch (error) {
      console.error(error)
    }

    return ""
  },

  relativeTime: (value: Date, targetDate: Date, lng?: string) => {
    const units = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: (24 * 60 * 60 * 1000 * 365) / 12,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
    } as const

    const formatter = new Intl.RelativeTimeFormat(lng, { numeric: "auto" })
    const elapsed = value.valueOf() - targetDate.valueOf()

    for (const key in units) {
      const unit = key as keyof typeof units
      if (Math.abs(elapsed) > units[unit] || unit === "second") {
        return formatter.format(Math.round(elapsed / units[unit]), unit)
      }
    }

    return null
  },
}

function parseFormatStr(formatStr: string | undefined) {
  let formatName = formatStr
  const formatOptions: Record<string, unknown> = {}

  if (formatStr != null && formatStr.indexOf("(") > -1) {
    const [name, args] = formatStr.split("(")
    formatName = name

    const optList = args
      .substring(0, args.length - 1)
      .split(";")
      .filter((x) => !!x)

    for (const item of optList) {
      const [key, ...rest] = item.split(":")
      formatOptions[key.trim()] = rest
        .join(":")
        .trim()
        .replace(/^'+|'+$/g, "")
    }
  }

  return {
    formatName: formatName?.toLowerCase().trim(),
    formatOptions,
  }
}

export const interpolationFormat: FormatFunction = (
  value,
  format,
  lng,
  tOptions,
) => {
  const { formatName, formatOptions } = parseFormatStr(format)
  const options = { ...formatOptions, ...tOptions }

  switch (formatName) {
    case "number":
      return formatters.number(value, lng, options)

    case "currency":
      return formatters.currency(value, lng, options)

    case "date":
      return formatters.date(value, options)

    case "relative":
      return formatters.relativeTime(
        value,
        options.targetDate ?? new Date(),
        lng,
      )

    default:
      return value ?? null
  }
}
