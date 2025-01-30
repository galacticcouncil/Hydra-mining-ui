import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-flow: column;
  row-gap: 10px;
  padding: 20px;

  @media ${theme.viewport.gte.sm} {
    gap: 30px;
  }
`

export const SCryptoBlock = styled.a`
  position: relative;

  display: flex;

  flex-direction: column;
  gap: 20px;

  border-radius: ${theme.borderRadius.medium}px;
  padding: 20px;

  transition: background-color ${theme.transitions.default};

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);

  :hover {
    background-color: rgba(${theme.rgbColors.alpha0}, 0.1);
  }

  @media ${theme.viewport.gte.sm} {
    gap: 30px;
    padding: 30px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`
