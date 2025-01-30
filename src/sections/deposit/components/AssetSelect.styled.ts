import styled from "@emotion/styled"
import { theme } from "theme"

export const SAssetSelect = styled.div`
  display: flex;
  flex-direction: column;
`

export const SAssetSelectItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 14px 12px;

  cursor: pointer;

  border-bottom: 1px solid rgba(${theme.rgbColors.primaryA06}, 0.06);
  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  }
`
