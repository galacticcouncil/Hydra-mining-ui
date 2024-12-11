import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SAccountItem = styled.div<{
  isActive?: boolean
  isProxy?: boolean
  withButton?: boolean
}>`
  --secondary-color: ${({ isActive }) =>
    isActive ? theme.colors.pink600 : theme.colors.brightBlue300};

  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 4px 16px;
  border-radius: ${theme.borderRadius.medium}px;

  min-height: 65px;

  transition: background ${theme.transitions.default};

  position: relative;

  border: 1px solid transparent;

  ${({ withButton }) =>
    withButton &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}

  ${(p) => {
    if (p.isProxy) {
      return css`
        border: 1px solid rgba(${theme.rgbColors.primaryA0}, 0.35);
        position: relative;
      `
    }

    if (p.isActive) {
      return css`
        position: relative;
        border: 1px solid rgba(${theme.rgbColors.brightBlue300}, 0.12);

        &,
        &:active,
        &:hover {
          background: rgba(${theme.rgbColors.primaryA15}, 0.12);
        }
      `
    }

    return css`
      background: rgba(${theme.rgbColors.alpha0}, 0.06);

      cursor: pointer;

      &:hover,
      &:active {
        background: rgba(${theme.rgbColors.alpha0}, 0.12);
      }
    `
  }}
`

export const SChangeAccountButton = styled(Button)<{ isActive?: boolean }>`
  border: 1px solid transparent;
  border-color: ${({ isActive }) =>
    isActive ? `rgba(${theme.rgbColors.brightBlue300}, 0.12)` : ""};
  border-top-color: ${({ isActive }) =>
    isActive ? `transparent` : `rgba(${theme.rgbColors.alpha0}, 0.12)`};

  border-radius: ${theme.borderRadius.medium}px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;

  background: ${({ isActive }) =>
    isActive
      ? `rgba(${theme.rgbColors.primaryA15}, 0.12)`
      : `rgba(${theme.rgbColors.alpha0}, 0.06)`};
`
