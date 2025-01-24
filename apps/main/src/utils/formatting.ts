export const wsToHttp = (url: string) =>
  url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )
