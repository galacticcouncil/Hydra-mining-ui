import * as Tooltip from "@radix-ui/react-tooltip"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useState } from "react"
import { theme } from "theme"
import { SContent, SInfoIcon, STrigger } from "./InfoTooltip.styled"

type InfoTooltipProps = {
  text: ReactNode | string
  children?: ReactNode
  type?: "default" | "black"
  side?: Tooltip.TooltipContentProps["side"]
  align?: Tooltip.TooltipContentProps["align"]
  asChild?: boolean
  preventDefault?: boolean
}

export function InfoTooltip({
  text,
  children,
  type = "default",
  side = "bottom",
  align = "start",
  asChild = false,
  preventDefault,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false)

  const Trigger = asChild ? Tooltip.Trigger : STrigger

  return (
    <Tooltip.Root delayDuration={0} open={open} onOpenChange={setOpen}>
      <Trigger
        type="button"
        asChild={asChild}
        onClick={(e) => {
          if (!!preventDefault) {
            e.preventDefault()
            e.stopPropagation()
          }

          setOpen(true)
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {children || <SInfoIcon />}
      </Trigger>
      <Tooltip.Portal>
        <SContent
          type={type}
          side={side}
          align={align}
          sideOffset={3}
          alignOffset={-10}
          collisionPadding={12}
          sx={{ maxWidth: 300 }}
        >
          {typeof text === "string" ? (
            <Text fs={12} lh={16}>
              {text}
            </Text>
          ) : (
            text
          )}
          {type === "default" && (
            <Tooltip.Arrow
              css={{
                "& > polygon": { fill: theme.colors.darkBlue400 },
              }}
            />
          )}
        </SContent>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
