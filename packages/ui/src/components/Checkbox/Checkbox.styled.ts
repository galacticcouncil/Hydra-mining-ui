import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { CheckboxProps, Root } from "@radix-ui/react-checkbox"

export type CheckboxSize = "small" | "medium" | "large"

export type TCheckbox = CheckboxProps & {
  size?: CheckboxSize
}

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`

const getRootSize = (size: CheckboxSize) => {
  switch (size) {
    case "small":
      return css`
        width: 12px;
        height: 12px;
      `
    case "medium":
      return css`
        width: 16px;
        height: 16px;
      `
    case "large":
      return css`
        width: 20px;
        height: 20px;
      `
  }
}

export const SRoot = styled(Root)<{ size: CheckboxSize }>(
  ({ theme, size, disabled }) => [
    css`
      display: block;

      flex-shrink: 0;

      border: 1px solid ${theme.controls.outline.base};
      border-radius: 4px;

      background: ${theme.controls.dim.base};

      cursor: pointer;

      transition: ${theme.transitions.colors};

      :not(:disabled):hover {
        border-color: ${theme.controls.outline.hover};
        background: ${theme.controls.dim.hover};
      }
    `,
    getRootSize(size),
    disabled && disabledStyles,
  ],
)

export const SIndicator = styled.div(
  ({ theme }) => css`
    margin: auto;
    background: ${theme.controls.solid.active};
    width: 50%;
    height: 50%;

    border-radius: 2px;
  `,
)
