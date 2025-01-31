import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { Chip } from "components/Chip"
import { theme } from "theme"

export const SProviderContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  padding-top: 12px;

  @media ${theme.viewport.gte.xs} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: repeat(4, 1fr);
  }
`

export const SProviderButton = styled(ButtonTransparent)`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;

  gap: 4px;

  padding: 16px 12px;

  border: none;
  border-radius: ${theme.borderRadius.medium}px;

  transition: background ${theme.transitions.default};
  cursor: pointer;

  background: rgba(${theme.rgbColors.alpha0}, 0.06);

  border: 1px solid rgba(${theme.rgbColors.brightBlue300}, 0.12);

  &:hover {
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
    border: 1px solid rgba(${theme.rgbColors.brightBlue300}, 0.12);
  }

  &:active {
    background: rgba(${theme.rgbColors.brightBlue100}, 0.35);
  }

  @media ${theme.viewport.gte.sm} {
    padding: 20px 12px;
  }
`

export const SProviderButtonLink = SProviderButton.withComponent("a")

export const SAltProviderButton = styled(Chip)`
  @media ${theme.viewport.lt.sm} {
    width: 100%;
    border-radius: ${theme.borderRadius.default}px;
  }
`

export const SExpandButton = styled(ButtonTransparent)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: ${theme.colors.basic400};

  svg {
    transition: ${theme.transitions.default};
  }

  &[aria-expanded="true"] {
    svg {
      transform: rotate(180deg);
    }
  }

  &:hover {
    color: ${theme.colors.brightBlue300};
`

export const SConnectionIndicator = styled.div`
  width: 4px;
  height: 4px;
  background: ${theme.colors.green600};

  border-radius: 50%;
  position: absolute;
  top: 8px;
  left: 8px;
`

export const SAccountIndicator = styled.div`
  font-size: 11px;
  font-family: "GeistSemiBold";
  color: ${theme.colors.white};

  border-radius: ${theme.borderRadius.default}px;
  background: rgba(${theme.rgbColors.darkBlue700}, 0.25);

  position: absolute;
  top: 4px;
  right: 4px;

  padding: 3px 5px;

  border: 1px solid rgba(${theme.rgbColors.brightBlue300}, 0.12);
`
