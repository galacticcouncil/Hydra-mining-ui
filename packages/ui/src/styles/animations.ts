import { keyframes } from "@emotion/react"

export const animations = {
  rotate: keyframes`
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  `,
  fadeInBack: keyframes`
    0% {
      transform: translateZ(80px);
      opacity: 0;
    }
    100% {
      transform: translateZ(0);
      opacity: 1;
    }
  `,
  fadeIn: keyframes`
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  `,
  fadeInForward: keyframes`
    0% {
      transform: translateZ(-80px);
      opacity: 0;
    }
    100% {
      transform: translateZ(0);
      opacity: 1;
    }
  `,
  fadeInTop: keyframes`
    0% {
      transform: translateY(-50px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  fadeInRight: keyframes`
    0% {
      transform: translateX(50px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  fadeInBottom: keyframes`
    0% {
      transform: translateY(50px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  fadeInLeft: keyframes`
    0% {
      transform: translateX(-50px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  fadeOut: keyframes`
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  `,
  fadeOutBack: keyframes`
    0% {
      transform: translateZ(0);
      opacity: 1;
    }
    100% {
      transform: translateZ(-80px);
      opacity: 0;
    }
  `,
  fadeOutForward: keyframes`
    0% {
      transform: translateZ(0);
      opacity: 1;
    }
    100% {
      transform: translateZ(80px);
      opacity: 0;
    }
  `,
  fadeOutTop: keyframes`
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-50px);
      opacity: 0;
    }
  `,
  fadeOutRight: keyframes`
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(50px);
      opacity: 0;
    }
  `,
  fadeOutBottom: keyframes`
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(50px);
      opacity: 0;
    }
  `,
  fadeOutLeft: keyframes`
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-50px);
      opacity: 0;
    }
  `,
  scaleInCenter: keyframes`
    0% {
      transform: scale(0.9);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  `,
  scaleOutCenter: keyframes`
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      opacity: 0;
    }
  `,
  scaleInTop: keyframes`
    0% {
      transform: scale(0.9);
      transform-origin: 50% 0;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 50% 0;
      opacity: 1;
    }
  `,
  scaleInRight: keyframes`
    0% {
      transform: scale(0.9);
      transform-origin: 100% 50%;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 100% 50%;
      opacity: 1;
    }
  `,
  scaleInBottom: keyframes`
    0% {
      transform: scale(0.9);
      transform-origin: 50% 100%;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 50% 100%;
      opacity: 1;
    }
  `,
  scaleInLeft: keyframes`
    0% {
      transform: scale(0.9);
      transform-origin: 0 50%;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 0 50%;
      opacity: 1;
    }
  `,
  scaleOutTop: keyframes`
    0% {
      transform: scale(1);
      transform-origin: 50% 0;
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      transform-origin: 50% 0;
      opacity: 0;
    }
  `,
  scaleOutRight: keyframes`
    0% {
      transform: scale(1);
      transform-origin: 100% 50%;
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      transform-origin: 100% 50%;
      opacity: 0;
    }
  `,
  scaleOutBottom: keyframes`
    0% {
      transform: scale(1);
      transform-origin: 50% 100%;
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      transform-origin: 50% 100%;
      opacity: 0;
    }
  `,
  scaleOutLeft: keyframes`
    0% {
      transform: scale(1);
      transform-origin: 0 50%;
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      transform-origin: 0 50%;
      opacity: 0;
    }
  `,
}
