import styled from "@emotion/styled"
import { Close, Content, Overlay } from "@radix-ui/react-dialog"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"
import { Text } from "@/components/Text"
import { mq } from "@/theme"

export const SModalOverlay = styled(Overlay)`
  position: fixed;
  inset: 0;

  display: grid;
  place-items: center;

  z-index: 10;

  backdrop-filter: blur(16px);

  &[data-state="open"] {
    animation: ${({ theme }) => theme.animations.fadeIn} 0.2s;
  }

  &[data-state="closed"] {
    animation: ${({ theme }) => theme.animations.fadeOut} 0.1s;
  }
`

export const SModalClose = styled(Close)`
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 16px;

  right: 0;
  top: 0;

  cursor: pointer;
`

export const SModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  top: 10vh;

  display: grid;
  gap: 4px;
  justify-items: center;

  z-index: 10;
`

export const SModalContent = styled(Content)`
  --modal-content-padding: 20px;

  position: fixed;
  inset: 0;
  outline: none;

  width: 100%;
  height: 100dvh;

  & > div > :not([hidden]) ~ :not([hidden]) {
    border-top: 1px solid ${({ theme }) => theme.details.borders};
  }

  &[data-state="open"] {
    animation: ${({ theme }) => theme.animations.fadeInBottom} 0.3s;
    animation-timing-function: ${({ theme }) => theme.easings.outExpo};
  }

  &[data-state="closed"] {
    animation: ${({ theme }) => theme.animations.fadeOut} 0.1s;
  }

  ${mq("sm")} {
    position: relative;
    inset: auto;

    max-width: 600px;
    height: auto;

    &[data-state="open"] {
      animation: ${({ theme }) => theme.animations.scaleInTop} 0.2s;
    }
  }
`

export const SModalPaper = styled(Paper)`
  display: flex;
  flex-direction: column;

  padding-bottom: env(safe-area-inset-bottom);

  ${mq("max-xs")} {
    height: 100%;
    border: 0;
    border-radius: 0;
  }

  ${mq("sm")} {
    height: auto;
    max-height: 75vh;
  }
`

export const SModalHeader = styled(Flex)`
  flex-direction: column;
  gap: 4px;

  padding: var(--modal-content-padding);

  & > input {
    width: auto;
    height: 100%;
    margin-left: calc(-1 * var(--modal-content-padding));
    margin: calc(-1 * var(--modal-content-padding));
  }
`

export const SModalBody = styled(Box)`
  padding: var(--modal-content-padding);

  overflow: overlay;
  flex: 1;
`

export const SModalFooter = styled(Flex)`
  flex-direction: column-reverse;
  gap: 10px;

  padding: 20px;

  ${mq("md")} {
    flex-direction: row;
  }
`

export const SModalTitle = styled(Text)`
  color: ${({ theme }) => theme.text.high};
  font-weight: 500;
  font-size: ${({ theme }) => theme.headlineSize.h7};
  font-family: ${({ theme }) => theme.fontFamilies1.primary};
`

export const SModalDescription = styled(Text)`
  color: ${({ theme }) => theme.text.medium};
  font-size: ${({ theme }) => theme.paragraphSize.p5};
`
