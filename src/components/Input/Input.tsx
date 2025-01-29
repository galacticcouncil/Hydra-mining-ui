import { Label } from "components/Label/Label"
import React, { ReactNode, forwardRef } from "react"
import { SWrapper, SInput } from "./Input.styled"

// Error handling should be added once we implement forms and validation, for now the input accepts error props

export type InputProps = {
  value: string
  onChange: (val: string) => void
  name: string
  label?: string
  unit?: string
  type?: string
  placeholder?: string
  error?: string
  withLabel?: boolean
  className?: string
  tooltip?: string
  disabled?: boolean
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      onChange,
      value,
      label,
      type = "text",
      placeholder,
      name,
      withLabel,
      tooltip,
      iconStart,
      iconEnd,
      ...p
    },
    ref,
  ) => {
    return (
      <Label
        label={label}
        error={p.error}
        withLabel={withLabel}
        tooltip={tooltip}
        id={name}
      >
        <SWrapper unit={p.unit}>
          {iconStart}
          <SInput
            ref={ref}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            value={value ?? ""}
            id={name}
            type={type}
            error={p.error}
            unit={p.unit}
            placeholder={placeholder}
            role="presentation"
            autoComplete="off"
            {...p}
          />
          {iconEnd}
        </SWrapper>
      </Label>
    )
  },
)
