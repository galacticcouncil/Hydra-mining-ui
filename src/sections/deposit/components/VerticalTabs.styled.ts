import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 3fr 9fr;
`

export const STabItem = styled(ButtonTransparent)`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 4px;

  line-height: 1;
  font-size: 12px;
  color: ${theme.colors.darkBlue200};

  width: 100%;
  margin-bottom: 2px;
  padding: 4px;

  border-radius: 4px;
  border: 1px solid transparent;

  transition: all ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.white};
  }

  &[data-active="true"] {
    color: ${theme.colors.white};
    border-color: rgba(${theme.rgbColors.brightBlue100}, 0.5);
    background: rgba(${theme.rgbColors.brightBlue100}, 0.2);
  }
`
