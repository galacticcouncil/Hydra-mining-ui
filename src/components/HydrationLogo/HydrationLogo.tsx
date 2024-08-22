import React, { useEffect, useState } from "react"
import {
  SLogoBadge,
  SLogoBadgeContainer,
  SContainer,
  SMobileLogoMask,
} from "./HydrationLogo.styled"
import { domAnimation, LazyMotion, m as motion } from "framer-motion"
import { useMedia } from "react-use"
import { useSettingsStore } from "state/store"
import { theme } from "theme"
import ApeIcon from "assets/icons/ApeIcon.svg?react"
import { useTranslation } from "react-i18next"

const hostname = window.location.hostname
const DEPLOY_PREVIEW_NAME =
  hostname.includes("deploy-preview") && hostname.match(/--([^-\s]+)-/)?.[1]

const HydrationLogoMobile: React.FC<{ degenMode: boolean }> = ({
  degenMode,
}) => (
  <>
    <SMobileLogoMask cropped={degenMode}>
      <svg width="24" height="24" viewBox="0 0 34 36" fill="none">
        <path
          d="M31.6056 20.3792C32.0061 19.9791 32.5216 19.4642 33.0334 18.9536C34.1751 17.8139 34.1757 15.9653 33.034 14.825L31.8246 13.617C27.4944 17.942 21.0145 18.811 15.8196 16.2245C19.3306 16.873 22.9693 16.3678 26.1935 14.6364C28.3505 13.478 28.7601 10.5561 27.0285 8.82661L19.8885 1.69517C18.293 0.10161 15.7065 0.10161 14.1116 1.69517L6.4156 9.38196C11.484 7.23123 17.5724 8.22834 21.6945 12.3739C15.4058 9.32516 7.61538 10.4069 2.39394 15.6214C1.99341 16.0215 1.47731 16.537 0.965456 17.0482C-0.175637 18.1885 -0.175032 20.0359 0.965456 21.1756L2.17431 22.383C6.50454 18.058 12.9844 17.189 18.1793 19.7755C14.6683 19.127 11.0296 19.6322 7.80536 21.3636C5.64842 22.522 5.23881 25.4439 6.97042 27.1734L14.1104 34.3048C15.7059 35.8984 18.2924 35.8984 19.8873 34.3048L27.5833 26.618C22.5149 28.7688 16.4265 27.7717 12.3038 23.6261C18.5925 26.6748 26.3829 25.5931 31.6044 20.3786L31.6056 20.3792Z"
          fill="url(#hydration-logo-gradient)"
        />
      </svg>
    </SMobileLogoMask>
    {DEPLOY_PREVIEW_NAME && (
      <div css={{ position: "absolute" }} sx={{ left: "100%" }}>
        <SLogoBadge sx={{ ml: 4, color: "white", bg: "pink700" }}>
          {DEPLOY_PREVIEW_NAME}
        </SLogoBadge>
      </div>
    )}
    {degenMode && (
      <ApeIcon
        width={12}
        height={12}
        sx={{
          bottom: -2,
          right: -2,
        }}
        css={{ position: "absolute" }}
      />
    )}
  </>
)

const HyderationLogoDesktop: React.FC<{ degenMode: boolean }> = ({
  degenMode,
}) => {
  const { t } = useTranslation()
  return (
    <>
      <svg width="105" height="22" viewBox="0 0 105 22" fill="none">
        <g clipPath="url(#clip0_442_21511)">
          <path
            d="M38.0313 16.7456C38.0313 16.8757 37.9337 16.9407 37.7217 16.925C36.5496 16.8599 35.6063 16.8599 34.4343 16.925C34.2223 16.9407 34.1247 16.8757 34.1247 16.7456C34.1247 16.6648 34.2223 16.5661 34.4175 16.4853C34.6945 16.371 34.7596 16.1107 34.7596 15.4602V12.0101H29.7995V15.4602C29.7995 16.1118 29.8646 16.372 30.1416 16.4853C30.3368 16.5661 30.4344 16.6648 30.4344 16.7456C30.4344 16.8757 30.3368 16.9407 30.1248 16.925C28.9528 16.8599 28.0094 16.8599 26.8374 16.925C26.6254 16.9407 26.5278 16.8757 26.5278 16.7456C26.5278 16.6648 26.6254 16.5829 26.8048 16.4853C27.1144 16.371 27.1627 16.1107 27.1627 15.4602V6.58944C27.1627 5.93888 27.1144 5.67761 26.8048 5.56428C26.6254 5.48244 26.5278 5.38485 26.5278 5.30406C26.5278 5.17395 26.6254 5.10889 26.8374 5.12463C28.0094 5.18969 28.9528 5.18969 30.1248 5.12463C30.3368 5.10889 30.4344 5.17395 30.4344 5.30406C30.4344 5.3859 30.3368 5.48349 30.1416 5.56428C29.8646 5.67761 29.7995 5.93888 29.7995 6.58944V11.3417H34.7596V6.58944C34.7596 5.93888 34.6945 5.67761 34.4175 5.56428C34.2223 5.48244 34.1247 5.38485 34.1247 5.30406C34.1247 5.17395 34.2223 5.10889 34.4343 5.12463C35.6063 5.18969 36.5496 5.18969 37.7217 5.12463C37.9337 5.10889 38.0313 5.17395 38.0313 5.30406C38.0313 5.3859 37.9337 5.48349 37.7385 5.56428C37.4615 5.67761 37.3964 5.93888 37.3964 6.58944V15.4591C37.3964 16.1107 37.4615 16.371 37.7385 16.4843C37.9337 16.5651 38.0313 16.6637 38.0313 16.7445V16.7456Z"
            fill="white"
          />
          <path
            d="M47.7079 7.81077C47.7079 7.94088 47.6271 8.02273 47.4635 8.07099C47.0889 8.13605 46.731 8.5757 46.4215 9.4057L43.4919 16.7791C43.2799 17.2838 43.1015 17.6741 42.9546 17.9837C42.8077 18.2932 42.5968 18.6185 42.3523 18.9606C41.8476 19.6605 41.2128 19.9857 40.4153 20.0508C39.6021 20.1316 39.0324 19.9207 38.706 19.416C38.4616 19.0414 38.4616 18.6993 38.706 18.3908C38.7868 18.2932 38.8855 18.2114 39.0156 18.1463C39.6672 17.9018 39.813 18.0162 40.2684 18.2271C40.5129 18.3415 40.6913 18.4065 40.8382 18.4223C41.5381 18.4873 42.1236 18.0152 42.5632 17.0225L39.0481 9.11294C38.7879 8.52744 38.7554 8.42985 38.6085 8.28295C38.5434 8.20215 38.4616 8.13605 38.365 8.08778C38.1699 8.00594 38.0723 7.90835 38.0723 7.81077C38.0723 7.69639 38.1699 7.63134 38.3818 7.64813C39.6189 7.71318 40.4647 7.71318 41.7018 7.64813C41.9137 7.63134 42.0113 7.69639 42.0113 7.81077C42.0113 7.90835 41.9137 8.00594 41.7186 8.08778C41.409 8.20215 41.4258 8.46238 41.686 9.11294L43.6556 14.2555C44.8434 11.3102 45.4782 9.68271 45.5926 9.4057C45.9178 8.60823 45.8528 8.16858 45.3974 8.08778C45.0071 7.97341 45.0071 7.64813 45.4142 7.64813C45.9672 7.68066 46.325 7.69639 46.4719 7.69639C46.5862 7.69639 46.8947 7.68066 47.4162 7.64813C47.6114 7.63134 47.709 7.69639 47.709 7.81077H47.7079Z"
            fill="white"
          />
          <path
            d="M57.0713 16.6152C57.0713 16.7295 56.9737 16.7946 56.7618 16.7946C55.639 16.8271 54.809 16.8754 54.255 16.9415C54.0598 16.974 53.9623 16.8764 53.9623 16.6645V15.4274C53.36 16.5669 52.3831 17.1356 51.0494 17.1356C49.7966 17.1356 48.7871 16.6634 48.0547 15.7201C47.3223 14.7758 46.9802 13.4904 47.0296 11.8797C47.0789 10.3981 47.5343 9.25961 48.4125 8.46214C49.3076 7.66468 50.3978 7.3394 51.7168 7.48525C52.7419 7.59962 53.4911 8.10328 53.9633 8.98259V7.37088C53.9633 6.78537 53.8489 6.4433 53.6212 6.34572C53.4261 6.26492 53.3285 6.18307 53.3285 6.0687C53.3285 5.95433 53.4261 5.85674 53.6055 5.79169C54.5173 5.62905 55.3631 5.35203 56.128 4.9617C56.2749 4.87985 56.4208 4.94491 56.4208 5.12434V15.3455C56.4208 15.9803 56.5026 16.2406 56.7786 16.3549C56.9737 16.4357 57.0713 16.5344 57.0713 16.6152ZM53.9948 12.547V11.7979C53.9297 9.43799 53.0021 8.20087 51.6181 8.26592C50.9665 8.28166 50.4629 8.68879 50.0883 9.47052C49.7137 10.2522 49.551 11.2281 49.5678 12.4001C49.5846 13.5879 49.8123 14.4998 50.2677 15.1671C50.7231 15.8188 51.2771 16.1272 51.9277 16.0947C53.1648 16.0464 53.9297 14.8093 53.9948 12.547Z"
            fill="white"
          />
          <path
            d="M64.8728 8.41303C65.1172 8.91774 65.1172 9.37313 64.8402 9.81279C64.6283 10.1549 64.3198 10.3332 63.8959 10.3175C63.3261 10.3175 63.0491 9.89463 62.9683 9.50429C62.9032 9.09717 62.5937 8.6743 61.9914 8.6743C61.2265 8.6743 60.8361 9.48855 60.8361 11.0992V15.4611C60.8361 16.1128 60.983 16.3887 61.3891 16.5031C61.6011 16.5681 61.6986 16.65 61.6986 16.7476C61.6986 16.8777 61.5843 16.9427 61.3734 16.927C60.1362 16.8619 59.2087 16.8619 58.0366 16.927C57.8246 16.9427 57.7271 16.8777 57.7271 16.7476C57.7271 16.6668 57.8246 16.5681 58.0198 16.4874C58.2643 16.4066 58.3776 16.0645 58.3776 15.4622V10.0426C58.3776 9.45708 58.2643 9.11501 58.0198 9.01742C57.8246 8.93663 57.7271 8.85478 57.7271 8.74041C57.7271 8.62603 57.8078 8.54524 57.9547 8.51271C58.7847 8.33328 59.5979 8.05732 60.3797 7.65019C60.5591 7.55261 60.6724 7.60087 60.6892 7.81283L60.8036 9.13074V9.18006C61.1939 8.02479 61.9106 7.43823 62.9683 7.43823C63.9284 7.43823 64.5632 7.76351 64.8728 8.41513V8.41303Z"
            fill="white"
          />
          <path
            d="M73.6808 16.7131C73.6808 16.86 73.5664 16.9251 73.3555 16.9251H73.1761C72.7365 16.9251 72.7207 16.9251 72.2811 16.8757C72.0691 16.86 71.8907 16.8107 71.7763 16.7614C71.3692 16.5337 70.9296 16.2241 70.7837 15.4592C70.2633 16.5169 69.0912 17.136 67.8048 17.136C66.0304 17.136 65.0052 16.2084 64.957 14.8905C64.8594 12.9377 66.6338 12.0752 68.1468 11.7331C69.1888 11.4561 70.3441 11.1802 70.7344 10.8706V10.6104C70.7344 8.70593 70.4416 7.86019 69.3346 7.86019C67.1542 7.86019 68.7166 10.5947 66.7471 10.4803C66.3074 10.4645 66.0304 10.2358 65.9003 9.82867C65.7377 9.34075 65.8678 8.86857 66.3074 8.39638C66.9255 7.76156 67.9349 7.43628 69.3346 7.43628C71.8739 7.43628 73.1593 8.49397 73.1593 10.8381C73.1593 10.985 73.1593 11.6681 73.1751 12.8884C73.1908 14.1087 73.1908 14.8905 73.1908 15.2325C73.1908 15.8842 73.2559 16.2745 73.386 16.4203C73.5161 16.5505 73.6787 16.583 73.6787 16.7131H73.6808ZM70.7187 14.028L70.7344 11.6513C70.5875 11.7489 70.2947 11.8958 69.8551 12.0742C69.4154 12.2536 69.0419 12.432 68.6998 12.5946C68.0482 12.9199 67.3819 13.6366 67.447 14.5316C67.4952 15.2965 68.1143 15.7519 68.895 15.7362C70.002 15.7362 70.7176 14.9387 70.7176 14.0269L70.7187 14.028Z"
            fill="white"
          />
          <path
            d="M78.8103 16.2734C78.4032 16.8264 77.7851 17.1034 76.9551 17.1034C75.5396 17.1034 74.8398 16.3868 74.8398 14.9555V8.31454H74.27C74.0916 8.31454 74.0098 8.20122 74.0098 7.97247C74.0098 7.71224 74.0591 7.64719 74.27 7.64719H74.4819C74.9541 7.64719 75.4095 7.46776 75.8324 7.12674C76.272 6.76893 76.5648 6.34501 76.7274 5.84135C76.7757 5.69445 76.8743 5.62939 77.0202 5.62939C77.1996 5.62939 77.2972 5.71019 77.2972 5.88962V7.64719H78.5994C78.762 7.64719 78.8439 7.76051 78.8439 7.97247C78.8439 8.20017 78.7631 8.31454 78.5994 8.31454H77.2972V15.0689C77.2972 15.7037 77.4599 16.0457 77.8019 16.1108C77.8995 16.1265 78.1272 16.0783 78.4693 15.9639C78.6487 15.8663 78.762 15.8495 78.8271 15.9156C78.9079 15.9964 78.9079 16.1108 78.8113 16.2734H78.8103Z"
            fill="white"
          />
          <path
            d="M83.3279 16.7456C83.3279 16.8757 83.2303 16.9408 83.0183 16.925C82.4328 16.8925 81.9113 16.8757 81.4559 16.8757C80.968 16.8757 80.4465 16.8914 79.8935 16.925C79.6816 16.9408 79.584 16.8757 79.584 16.7456C79.584 16.6648 79.6816 16.5662 79.8767 16.4854C80.1537 16.371 80.2188 16.1108 80.2188 15.4602V10.0563C80.2188 9.42152 80.1537 9.16129 79.8767 9.03118C79.6816 8.95039 79.584 8.86854 79.584 8.75417C79.584 8.63979 79.6816 8.54221 79.8767 8.47715C80.7886 8.29772 81.6186 8.02176 82.3835 7.64716C82.5955 7.54958 82.693 7.59784 82.693 7.8098V15.4592C82.693 16.1108 82.7581 16.371 83.0351 16.4843C83.2303 16.5651 83.3279 16.6638 83.3279 16.7445V16.7456ZM80.2031 6.5412C79.5682 6.02075 79.5682 5.17397 80.2031 4.65352C80.8379 4.13307 81.8473 4.13307 82.4811 4.65352C83.1159 5.17397 83.1159 6.02075 82.4811 6.5412C81.8463 7.04591 80.8368 7.04591 80.2031 6.5412Z"
            fill="white"
          />
          <path
            d="M92.1718 8.83604C93.0511 9.76362 93.4898 10.9189 93.4898 12.2861C93.4898 13.6534 93.0501 14.8254 92.1718 15.753C91.3093 16.6806 90.154 17.136 88.7375 17.136C87.3209 17.136 86.1657 16.6806 85.3031 15.753C84.4406 14.8254 84.001 13.6701 84.001 12.2861C84.0167 10.9032 84.4564 9.76362 85.3189 8.83604C86.1814 7.90846 87.3209 7.43628 88.7364 7.43628C90.1519 7.43628 91.3083 7.90846 92.1708 8.83604H92.1718ZM86.5571 12.6607C86.769 13.8811 87.1426 14.8579 87.6798 15.6229C88.217 16.3878 88.8519 16.6974 89.5843 16.583C91.0648 16.2902 91.3261 14.1581 90.9347 11.9115C90.7228 10.6912 90.3492 9.7143 89.812 8.94936C89.2747 8.18443 88.6399 7.87489 87.9243 7.98926C86.3944 8.28201 86.1499 10.4142 86.5571 12.6607Z"
            fill="white"
          />
          <path
            d="M104.079 16.7456C104.079 16.8757 103.982 16.9408 103.77 16.9251C102.663 16.86 101.752 16.86 100.645 16.9251C100.433 16.9408 100.336 16.8757 100.336 16.7456C100.336 16.6648 100.433 16.5662 100.628 16.4854C100.905 16.371 100.97 16.1108 100.97 15.4602V11.3103C100.97 9.52018 100.368 8.62513 99.1635 8.62513C98.4961 8.62513 97.9914 8.88536 97.6493 9.40581C97.3073 9.91052 97.1446 10.5286 97.1446 11.2284V15.4602C97.1446 16.0625 97.258 16.4046 97.5024 16.4854C97.6819 16.5662 97.7795 16.6648 97.7795 16.7456C97.7795 16.8757 97.6819 16.9408 97.4699 16.9251C96.9495 16.8925 96.428 16.8757 95.9243 16.8757C95.4206 16.8757 94.9149 16.8915 94.3619 16.9251C94.1499 16.9408 94.0524 16.8757 94.0524 16.7456C94.0524 16.6648 94.1499 16.583 94.3294 16.4854C94.5739 16.4046 94.6872 16.0625 94.6872 15.4602V10.0406C94.6872 9.45512 94.5739 9.11305 94.3294 9.01547C94.1342 8.93467 94.0366 8.85283 94.0366 8.73845C94.0366 8.62408 94.1174 8.54329 94.2643 8.51076C95.0943 8.33133 95.9075 8.05536 96.6892 7.64824C96.8687 7.55065 96.982 7.59892 96.9988 7.81088L97.1132 9.12879L97.1289 9.29143C97.6987 8.05431 98.6913 7.43628 100.091 7.43628C102.418 7.43628 103.444 8.68914 103.444 11.3103V15.4602C103.444 16.1119 103.509 16.3721 103.786 16.4854C103.981 16.5662 104.078 16.6648 104.078 16.7456H104.079Z"
            fill="white"
          />
          <motion.path
            animate={{
              rotate: degenMode ? 180 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: "backOut",
            }}
            d="M19.2797 12.3981C19.5148 12.163 19.8169 11.8608 20.1181 11.5607C20.7886 10.8913 20.7886 9.80421 20.1181 9.13371L19.4077 8.42334C16.8653 10.9658 13.0616 11.4757 10.0123 9.95636C12.0731 10.3372 14.2095 10.0403 16.1024 9.02248C17.3689 8.34149 17.6092 6.62484 16.5925 5.60808L12.4005 1.41614C11.4635 0.479124 9.94518 0.479124 9.00921 1.41614L4.49094 5.93441C7.46674 4.67001 11.0406 5.25656 13.4603 7.69303C9.7689 5.90083 5.19502 6.5367 2.13003 9.60169C1.89498 9.83673 1.59174 10.14 1.29164 10.4401C0.622188 11.1106 0.622188 12.1966 1.29164 12.866L2.00096 13.5754C4.5434 11.0329 8.3471 10.523 11.3964 12.0424C9.33554 11.6615 7.19917 11.9584 5.30624 12.9762C4.03974 13.6572 3.79945 15.3739 4.81622 16.3906L9.00816 20.5826C9.94518 21.5196 11.4635 21.5196 12.3995 20.5826L16.9177 16.0643C13.9419 17.3287 10.368 16.7421 7.94837 14.3057C11.6398 16.0979 16.2137 15.462 19.2787 12.397L19.2797 12.3981Z"
            fill="url(#hydration-logo-gradient)"
          />
        </g>
        <defs>
          <clipPath id="clip0_442_21511">
            <rect
              width="103.281"
              height="20.5714"
              fill="white"
              transform="translate(0.789062 0.714355)"
            />
          </clipPath>
        </defs>
      </svg>

      <SLogoBadgeContainer>
        <SLogoBadge
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: degenMode ? "0" : "-100%", opacity: degenMode ? 1 : 0 }}
          transition={{
            duration: 0.4,
            ease: "backOut",
          }}
        >
          {t("header.settings.degenMode.title")}
        </SLogoBadge>
        {DEPLOY_PREVIEW_NAME && (
          <SLogoBadge sx={{ ml: 2, color: "white", bg: "pink700" }}>
            {DEPLOY_PREVIEW_NAME}
          </SLogoBadge>
        )}
      </SLogoBadgeContainer>
    </>
  )
}

export const HydrationLogo = () => {
  const { degenMode } = useSettingsStore()
  const [delayedDegenMode, setDelayedDegenMode] = useState(degenMode)

  const isDesktop = useMedia(theme.viewport.gte.md)

  useEffect(() => {
    const id = setTimeout(
      () => {
        setDelayedDegenMode(degenMode)
      },
      degenMode ? 500 : 0,
    )

    return () => {
      clearTimeout(id)
    }
  }, [degenMode])

  return (
    <LazyMotion features={domAnimation}>
      <SContainer>
        {isDesktop ? (
          <HyderationLogoDesktop degenMode={delayedDegenMode} />
        ) : (
          <HydrationLogoMobile degenMode={delayedDegenMode} />
        )}
      </SContainer>
      <svg width={0} height={0} sx={{ opacity: 0 }}>
        <defs>
          <motion.linearGradient id="hydration-logo-gradient">
            {delayedDegenMode ? (
              <>
                <stop stopColor={theme.colors.pink600} />
                <stop offset="1" stopColor={theme.colors.brightBlue600} />
              </>
            ) : (
              <stop stop-color="#ffffff" />
            )}
          </motion.linearGradient>
        </defs>
      </svg>
    </LazyMotion>
  )
}
