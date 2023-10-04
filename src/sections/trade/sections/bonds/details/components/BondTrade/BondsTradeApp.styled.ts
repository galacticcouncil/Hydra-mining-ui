import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  --scrollbar-url: url("images/Scrollbar.svg");
  margin: 0 -12px;

  @media ${theme.viewport.gte.sm} {
    margin: 0 -20px;

    margin-bottom: -20px;
  }

  @media ${theme.viewport.lt.xs} {
    display: flex;
    flex: 1;
    background: #111320;

    gc-bonds-app {
      flex: 1;
    }
  }
`
