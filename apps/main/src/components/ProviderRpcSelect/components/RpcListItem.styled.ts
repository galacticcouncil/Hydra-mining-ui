import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

export const SRpcListItem = styled(Box)`
  display: grid;
  grid-template-columns: 3fr 2fr 1fr;
  gap: 10px;

  &[data-edit="true"] {
    grid-template-columns: 1fr 1fr;
    background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
  }

  &[data-loading="true"] {
    opacity: 0.5;
    pointer-events: none;
  }

  ${mq("sm")} {
    grid-template-columns: 3fr 2fr 5fr;
  }

  align-items: center;

  padding: 10px var(--modal-content-padding);

  &:not(:first-of-type) {
    height: 56px;
  }
  &:not(:first-of-type) {
    cursor: pointer;
    &:hover,
    &:active {
      transition: ${({ theme }) => theme.transitions.colors};
      background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
    }
  }

  & > * {
    min-width: 0;
  }

  p {
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const SRpcRadio = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;

    flex-shrink: 0;

    width: 14px;
    height: 14px;

    border-radius: ${theme.radii.full}px;
    background: ${theme.controls.dim.base};
    border: 1px solid ${theme.controls.outline.base};

    transition: all ${theme.transitions.colors};
    flex-shrink: 0;
  `,
)

export const SRpcRadioThumb = styled.div(
  ({ theme }) => css`
    width: 10px;
    height: 10px;

    background: ${theme.controls.solid.active};
    border-radius: ${theme.radii.full}px;

    animation: ${theme.animations.scaleInCenter} 0.2s;
  `,
)
