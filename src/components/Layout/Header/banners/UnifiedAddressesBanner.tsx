import CrossIcon from "assets/icons/CrossIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import Star from "assets/icons/Star.svg?react"
import addrFormatImage from "assets/images/unified-addresses-art.webp"
import { Button } from "components/Button/Button"
import {
  SAddressArrow,
  SAddressBox,
  SAddressContainer,
} from "./UnifiedAddressesBanner.styled"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import {
  SSecondaryItem,
  SWarningMessageContainer,
  SWarningMessageContent,
} from "components/WarningMessage/WarningMessage.styled"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { PolkadotAvatar } from "components/AccountAvatar/PolkadotAvatar"
import { safeConvertAddressSS58 } from "utils/formatting"

const EXAMPLE_ADDRESS = "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba"

type UnifiedAddressesBannerProps = {
  onAccept: () => void
}

export const UnifiedAddressesBanner: React.FC<UnifiedAddressesBannerProps> = ({
  onAccept,
}) => {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)

  const handleAccept = () => {
    setModalOpen(false)
    onAccept()
  }

  return (
    <>
      <SWarningMessageContainer
        onClick={() => setModalOpen(true)}
        variant="pink"
      >
        <SSecondaryItem />
        <SWarningMessageContent sx={{ fontWeight: 600 }}>
          <Star width={12} height={12} sx={{ flexShrink: 0 }} />
          <div
            sx={{
              flex: ["column", "row"],
              align: ["start", "center"],
              gap: [6, 0],
            }}
          >
            {t("unifiedAddresses.banner.title")}
            <Separator
              orientation="vertical"
              color="black"
              size={1}
              sx={{
                display: ["none", "block"],
                height: 12,
                mx: 12,
                opacity: 0.25,
              }}
            />
            <span
              css={{
                whiteSpace: "nowrap",
                opacity: 0.7,
                "&:hover": { opacity: 1 },
              }}
            >
              {t("stats.tiles.link")}
              <LinkIcon sx={{ ml: 10, mb: -2 }} css={{ rotate: "45deg" }} />
            </span>
          </div>
        </SWarningMessageContent>
        <SSecondaryItem
          css={{
            justifyContent: "flex-end",
          }}
        >
          <CrossIcon
            onClick={(e) => {
              e.stopPropagation()
              onAccept()
            }}
          />
        </SSecondaryItem>
      </SWarningMessageContainer>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalContents
          contents={[
            {
              headerVariant: "simple",
              content: (
                <div sx={{ mt: -40 }}>
                  <div sx={{ px: [20, 40] }}>
                    <img
                      loading="lazy"
                      src={addrFormatImage}
                      alt=""
                      width="100%"
                      height="auto"
                      sx={{ aspectRatio: "462/288", mb: 20 }}
                    />
                    <Text
                      font="GeistMonoSemiBold"
                      fs={22}
                      tAlign="center"
                      sx={{ mb: 20 }}
                    >
                      {t("unifiedAddresses.modal.title")}
                    </Text>

                    <Text
                      color="basic400"
                      lh={20}
                      fs={14}
                      tAlign="center"
                      sx={{ mb: 20 }}
                    >
                      {t("unifiedAddresses.modal.description1")}
                    </Text>

                    <SAddressContainer sx={{ mb: 20 }}>
                      <SAddressArrow />
                      <SAddressBox>
                        <PolkadotAvatar
                          sx={{ flexShrink: 0 }}
                          address={EXAMPLE_ADDRESS}
                          size={28}
                        />
                        <span>{EXAMPLE_ADDRESS}</span>
                      </SAddressBox>
                      <SAddressBox highlighted>
                        <PolkadotAvatar
                          sx={{ flexShrink: 0 }}
                          address={safeConvertAddressSS58(EXAMPLE_ADDRESS, 0)!}
                          size={28}
                        />
                        <span>
                          {safeConvertAddressSS58(EXAMPLE_ADDRESS, 0)!}
                        </span>
                      </SAddressBox>
                    </SAddressContainer>
                    <Text color="basic400" lh={20} fs={14} tAlign="center">
                      <Trans
                        t={t}
                        i18nKey="unifiedAddresses.modal.description2"
                      />
                    </Text>
                  </div>
                  <div
                    sx={{
                      flex: ["column", "row"],
                      justify: "space-between",
                      mt: 40,
                      gap: 20,
                    }}
                  >
                    <Button onClick={handleAccept} variant="secondary">
                      {t("unifiedAddresses.modal.cta2")}
                    </Button>
                    <Button onClick={handleAccept} variant="primary">
                      {t("unifiedAddresses.modal.cta1")}
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  )
}
