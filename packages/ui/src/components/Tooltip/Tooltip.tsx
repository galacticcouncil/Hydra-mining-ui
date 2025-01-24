import {
  Portal,
  Root,
  TooltipContentProps,
  Trigger,
} from "@radix-ui/react-tooltip"
import { ReactNode, useState } from "react"

import { CircleInfo } from "@/assets/icons"
import { Text } from "@/components"

import { SContent, SInfoIcon, STrigger } from "./Tooltip.styled"

type InfoTooltipProps = {
  text: ReactNode | string
  children?: ReactNode
  side?: TooltipContentProps["side"]
  align?: TooltipContentProps["align"]
  asChild?: boolean
  preventDefault?: boolean
}

export const Tooltip = ({
  text,
  children,
  side = "bottom",
  align = "center",
  asChild = false,
  preventDefault,
}: InfoTooltipProps) => {
  const [open, setOpen] = useState(false)

  const TriggerComp = asChild ? Trigger : STrigger

  return (
    <Root delayDuration={0} open={open} onOpenChange={setOpen}>
      <TriggerComp
        type="button"
        asChild={asChild}
        onClick={(e) => {
          if (preventDefault) {
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
        {children || <SInfoIcon component={CircleInfo} />}
      </TriggerComp>
      <Portal>
        <SContent
          side={side}
          align={align}
          sideOffset={3}
          alignOffset={-10}
          collisionPadding={12}
        >
          {typeof text === "string" ? (
            <Text fw={500} fs={12}>
              {text}
            </Text>
          ) : (
            text
          )}
        </SContent>
      </Portal>
    </Root>
  )
}
