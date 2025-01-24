import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"

export const SRpcList = styled(Box)`
  display: flex;
  flex-direction: column;
  & > * {
    border-top: 1px solid ${({ theme }) => theme.details.separators};
    &:first-of-type {
      border-top: none;
    }
  }
`
