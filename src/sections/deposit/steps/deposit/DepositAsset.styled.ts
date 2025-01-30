import styled from "@emotion/styled"
import { theme } from "theme"

export const SAssetSelectButtonBox = styled.div`
  background: rgba(${theme.rgbColors.alpha0}, 0.06);
  border-bottom: 1px solid ${theme.colors.darkBlue400};
  height: 90px;
  position: relative;

  padding: 10px 16px 0;

  transition: ${theme.transitions.default};

  &:focus,
  &:hover {
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
    border-bottom: 1px solid ${theme.colors.brightBlue600};
  }

  & > button {
    position: absolute;
    inset: 0;
    height: 100%;
    padding: 25px 16px 0;

    &:focus,
    &:hover {
      background: transparent;
    }

    & svg {
      margin-top: -25px;
    }
  }
`

export const SAccountBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  gap: 12px;
  padding: 20px 12px;

  border-radius: 8px;
  border: 1px solid rgba(51, 55, 80, 0.4);

  background: #151725;
`
