import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-tooltip"
import { theme } from "theme"

export const SCopyDropdownContent = styled(Content)`
  display: flex;
  min-width: 120px;
  padding: 12px;

  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  border-radius: 12px;
  border: 1px solid rgba(${theme.rgbColors.primaryA06}, 0.06);
  background: ${theme.colors.basic1000};
  box-shadow: 0px 40px 70px 0px rgba(0, 0, 0, 0.8);
  z-index: ${theme.zIndices.modal};
`

export const SCopyDropdownItem = styled.p`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  color: ${theme.colors.basic400};
  padding: 8px;
  border-radius: 6px;
  background: rgba(158, 167, 186, 0.03);

  cursor: pointer;

  &:hover {
    color: ${theme.colors.white};
    background: rgba(255, 255, 255, 0.06);
  }
`
