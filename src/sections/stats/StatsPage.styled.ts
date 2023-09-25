import styled from "@emotion/styled"
import { theme } from "theme"

export const SStatsCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;

  background-color: rgba(6, 9, 23, 0.4);
  border-radius: ${theme.borderRadius.default}px;

  position: relative;

  padding: 20px;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: ${theme.borderRadius.default}px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.27) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
      rgba(158, 167, 180, 0.2) 100%
    );

    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media (${theme.viewport.gte.sm}) {
    padding: 20px;
  }
`

export const SContainerVertical = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  background-color: rgba(6, 9, 23, 0.4);
  border-radius: 4px;

  position: relative;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.22) 0%,
      rgba(163, 177, 199, 0.15) 50.67%,
      rgba(91, 151, 245, 0) 90.99%,
      rgba(158, 167, 180, 0) 100%
    );

    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`
