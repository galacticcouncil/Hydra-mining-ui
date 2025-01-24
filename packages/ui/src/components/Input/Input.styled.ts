import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

export type CustomInputProps = {
  customSize?: "small" | "medium" | "large"
  variant?: "embedded" | "standalone"
  isError?: boolean
  isFullWidth?: boolean
  disabled?: boolean
}

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;
  }
`

const sizes = createVariants((theme) => ({
  small: css`
    height: 30px;
    padding: 0px ${theme.containers.paddings.tertiary}px;
    font-size: ${theme.paragraphSize.p6};
  `,
  medium: css`
    height: 36px;
    padding: 0px ${theme.containers.paddings.tertiary}px;
    font-size: ${theme.paragraphSize.p5};
  `,
  large: css`
    height: 54px;
    padding: 0px ${theme.containers.paddings.primary}px;
    font-size: ${theme.paragraphSize.p5};
  `,
}))

const variants = createVariants((theme) => ({
  embedded: css`
    border: none;

    :focus,
    :focus-visible,
    :hover {
      outline: none;
    }
  `,
  standalone: css`
    background-color: ${theme.buttons.outlineDark.rest};
    border: 1px solid ${theme.buttons.outlineDark.rest};
    border-radius: ${theme.radii.full}px;

    :focus,
    :focus-visible {
      outline: none;
      background-color: ${theme.buttons.outlineDark.hover};
      border-color: ${theme.buttons.secondary.outline.outline};
    }

    :hover {
      background-color: ${theme.buttons.outlineDark.hover};
      outline: none;
    }
  `,
}))

export const SInput = styled.input<CustomInputProps>(
  css``,
  ({
    theme,
    variant = "standalone",
    customSize = "medium",
    isError = false,
  }) => [
    sizes(customSize),
    variants(variant),
    css`
      width: 100%;

      box-sizing: border-box;

      display: flex;
      align-items: center;
      align-self: stretch;

      caret-color: ${theme.text.tint.Tertiary};

      cursor: text;
      font-weight: 500;

      transition: ${theme.transitions.colors};

      color: ${isError ? theme.accents.danger.secondary : theme.text.high};

      ::placeholder {
        color: ${theme.text.medium};
      }

      :disabled {
        cursor: not-allowed;
      }
    `,
    disabledStyles,
  ],
)

const groupSizes = createVariants(() => ({
  small: css`
    &:has([data-slot="icon"] + input) input {
      padding-left: 28px;
    }

    &:has(input + [data-slot="icon"]) input {
      padding-right: 28px;
    }

    & > [data-slot="icon"] {
      height: 14px;
      margin-top: -7px;
      left: 6px;
    }

    input + [data-slot="icon"] {
      left: auto;
      right: 6px;
    }
  `,
  medium: css`
    &:has([data-slot="icon"] + input) input {
      padding-left: 36px;
    }

    &:has(input + [data-slot="icon"]) input {
      padding-right: 36px;
    }

    & > [data-slot="icon"] {
      height: 18px;
      margin-top: -9px;
      left: 10px;
    }

    input + [data-slot="icon"] {
      left: auto;
      right: 10px;
    }
  `,
  large: css`
    &:has([data-slot="icon"] + input) input {
      padding-left: 48px;
    }

    &:has(input + [data-slot="icon"]) input {
      padding-right: 48px;
    }

    & > [data-slot="icon"] {
      height: 20px;
      margin-top: -10px;
      left: 16px;
    }

    input + [data-slot="icon"] {
      left: auto;
      right: 16px;
    }
  `,
}))

/* & > [data-slot="icon"] {
  height: 20px;
  margin-top: -10px;
  &:first-of-type {
    left: 16px;
  }
  &:last-of-type {
    right: 16px;
  }
} */

export const SInputGroup = styled.div<
  Pick<CustomInputProps, "customSize" | "disabled">
>(({ theme, disabled = false, customSize = "medium" }) => [
  groupSizes(customSize),
  css`
    position: relative;

    opacity: ${disabled ? 0.2 : 1};

    & > svg {
      pointer-events: none;
      color: ${theme.icons.onContainer};
    }

    & > [data-slot="icon"] {
      position: absolute;
      top: 50%;
    }
  `,
])
