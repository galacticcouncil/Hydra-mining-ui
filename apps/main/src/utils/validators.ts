import { z } from "zod"

import i18n from "@/i18n"

export const required = z.string().trim().min(1, i18n.t("error.required"))

export const WSS_REGEX =
  /^wss?:\/\/(localhost|[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:[0-9]+)?(\/.*)?$/i

export const validWebsocketUrl = z
  .string()
  .refine((value) => WSS_REGEX.test(value), i18n.t("error.invalidWebsocketUrl"))
