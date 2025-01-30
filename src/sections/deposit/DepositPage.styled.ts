import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`

export const SDepositContent = styled.div`
  --modal-content-padding: 16px;
  --modal-header-padding-y: 16px;
  --modal-header-padding-x: 16px;
  --modal-header-btn-size: 34px;
  --modal-header-height: calc(
    var(--modal-header-btn-size) + var(--modal-header-padding-y) * 1.5
  );

  &[data-page="0"],
  &[data-page="4"] {
    --modal-content-padding: 16px;
    --modal-header-padding-y: 0px;
    --modal-header-padding-x: 0px;
  }

  &[data-page="3"] {
    --modal-header-height: 16px;
  }

  position: relative;

  display: flex;
  flex-flow: column;
  margin: 0 -12px;

  overflow: hidden;

  background: ${theme.colors.darkBlue700};
  border-top: 1px solid rgba(158, 167, 180, 0.2);
  border-bottom: 1px solid rgba(158, 167, 180, 0.2);

  color: #fff;

  @media ${theme.viewport.gte.xs} {
    &[data-page="0"],
    &[data-page="4"] {
      --modal-content-padding: 30px;
    }

    &[data-page="3"] {
      --modal-header-height: 30px;
    }

    width: 100%;
    max-width: 610px;
    margin: 0 auto;

    border: 1px solid rgba(158, 167, 180, 0.2);

    border-radius: ${theme.borderRadius.medium}px;
  }
`
