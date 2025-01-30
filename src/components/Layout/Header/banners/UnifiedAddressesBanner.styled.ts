import styled from "@emotion/styled"
import { theme } from "theme"
import AddressChangeArrow from "assets/icons/AddressChangeArrow.svg?react"

export const SAddressContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 90%;
  margin: 0 auto;
  padding: 0 5px;
`

export const SAddressArrow = styled(AddressChangeArrow)`
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
`

export const SAddressBox = styled.div<{ highlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px;

  border-radius: 8px;
  border: ${({ highlighted }) => (highlighted ? "none" : "1px dashed #303344")};

  background: ${({ highlighted }) =>
    highlighted
      ? "linear-gradient(90deg, rgba(30, 56, 105, 0.70) 0%, rgba(24, 28, 56, 0.70) 39.16%, rgba(26, 28, 44, 0.70) 84%)"
      : "rgba(158, 167, 186, 0.01)"};

  color: ${({ highlighted }) =>
    highlighted ? theme.colors.white : theme.colors.basic300};

  font-size: 12px;
  line-height: 1;

  & > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
