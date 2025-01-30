import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SButton = styled(ButtonTransparent)`
  display: flex;
  padding: 16px 20px;
  align-items: center;
  justify-content: space-between;
  gap: 4px;

  width: 100%;

  transition: background ${theme.transitions.default};

  border-radius: 8px;
  background: rgba(${theme.rgbColors.alpha0}, 0.06);

  &:hover {
    background: rgba(${theme.rgbColors.alpha0}, 0.12);
  }
`
