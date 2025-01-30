import { useCallback, useEffect, useState } from "react"
import { useCopyToClipboard } from "react-use"

export function useCopy(resetTimeoutMs = 0) {
  const [copied, setCopied] = useState(false)
  const [, copyToClipboard] = useCopyToClipboard()

  useEffect(() => {
    if (!copied) return
    if (resetTimeoutMs <= 0) return
    const id = setTimeout(() => {
      setCopied(false)
    }, resetTimeoutMs)

    return () => {
      clearTimeout(id)
      setCopied(false)
    }
  }, [copied, resetTimeoutMs])

  const copy = useCallback(
    (text: string) => {
      copyToClipboard(text)
      setCopied(true)
    },
    [copyToClipboard],
  )

  return {
    copied,
    copy,
  }
}
