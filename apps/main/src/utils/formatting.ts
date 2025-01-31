const TRILL = 12
const QUINTILL = 18

const normalizeValue = (value: string | number | bigint) => {
  if (typeof value === "bigint") return value
  //if (typeof value === "string") return BigInt(value)

  return BigInt(value)
}

export const wsToHttp = (url: string) =>
  url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )

/**
 *
 * @param amount value to scale
 * @param decimals number of shifted places
 * @returns The shift is of the decimal point, i.e. of powers of ten, and is to the right.
 * eg.: 1.23456789 => 123456789
 */
export const scale = (
  amount: string | number | bigint,
  decimals: number | "t" | "q",
) => {
  const _decimals =
    decimals === "t" ? TRILL : decimals === "q" ? QUINTILL : decimals

  return normalizeValue(amount) * BigInt(10) ** BigInt(_decimals)
}

/**
 *
 * @param amount value to scale
 * @param decimals number of shifted places
 * @returns The shift is of the decimal point, i.e. of powers of ten, and is to the left.
 * eg.: 123456789 => 1.23456789
 */
export const scaleHuman = (
  amount: string | number | bigint,
  decimals: number | "t" | "q",
) => {
  const _decimals =
    decimals === "t" ? TRILL : decimals === "q" ? QUINTILL : decimals

  return normalizeValue(amount) * BigInt(10) ** BigInt(-_decimals)
}

export const isNegative = (amount: string | number | bigint) => {
  return normalizeValue(amount) < 0n
}
