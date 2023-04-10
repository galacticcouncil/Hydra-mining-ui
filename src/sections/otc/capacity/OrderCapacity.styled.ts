import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ modal: boolean }>`
  font-family: "ChakraPetch";
  background: rgba(10, 12, 22, 0.69);

  position: relative;
  text-align: center;
  margin: ${(p) => (p.modal ? "0 0 20px" : "0")};
  width: 100%;

  @media (${theme.viewport.gte.sm}) {
    background: inherit;
  }
`

export const SBarContainer = styled.div<{ modal: boolean }>`
  position: relative;
  width: 100%;
  height: ${(p) => (p.modal ? "11px" : "7px")};
  border-radius: 2px;
  background-color: rgba(84, 99, 128, 0.35);
`

export const SBar = styled.div<{ filled: string }>`
  height: 100%;
  border-radius: 2px;
  width: ${(p) => p.filled}%;
  -webkit-mask: linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0);

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      270deg,
      ${theme.colors.pink600} 0%,
      ${theme.colors.brightBlue600} 100%
    );
  }
`
