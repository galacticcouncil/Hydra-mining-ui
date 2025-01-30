import styled from "@emotion/styled"
import { theme } from "theme"

export const SRowNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  font-size: 11px;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  border: 1px solid ${theme.colors.brightBlue300};
  background: rgba(${theme.rgbColors.alpha0}, 0.35);
`
