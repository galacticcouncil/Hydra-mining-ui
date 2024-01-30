import { InterestRate } from "@aave/contract-helpers"
import { ExternalLinkIcon } from "@heroicons/react/outline"
import { CheckIcon } from "@heroicons/react/solid"
import { ContentCopyOutlined, Download, Twitter } from "@mui/icons-material"
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  SvgIcon,
  SvgIconProps,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { ReactNode, useRef, useState } from "react"
import { HeyIcon } from "sections/lending/components/icons/HeyIcon"
import {
  FormattedNumber,
  compactNumber,
} from "sections/lending/components/primitives/FormattedNumber"
import GhoSuccessImage from "sections/lending/components/transactions/Borrow/GhoSuccessImage"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

const CopyImageButton = styled(Button)(() => ({
  minWidth: 139,
  borderRadius: 32,
  background:
    "linear-gradient(252.63deg, rgba(255, 255, 255, 0.2) 33.91%, rgba(255, 255, 255, 0.08) 73.97%), linear-gradient(0deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))",
  transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  height: 48,
  "&:hover": {
    background:
      "linear-gradient(252.63deg, rgba(255, 255, 255, 0.2) 33.91%, rgba(255, 255, 255, 0.08) 73.97%), linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))",
    transform: "translateY(-3px)",
    border: "1px solid #FFFFFF20",
  },
  "&:disabled": {
    border: "1px solid #FFFFFF20",
  },
  backdropFilter: "blur(5px)",
  border: "1px solid #FFFFFF20",
})) as typeof Button

const IconButtonCustom = styled(IconButton)(() => ({
  backgroundColor: "white",
  width: 48,
  height: 48,
  transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  "&:hover": {
    backgroundColor: "white",
    transform: "translateY(-3px)",
    boxShadow: "0px 4px 4px 0px #00000040",
  },
})) as typeof IconButton

const ImageContainer = styled(Box)(() => ({
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    ".image-bar-gho": {
      display: "flex",
      bottom: 30,
    },
  },
}))

const ImageBar = styled(Box)(() => ({
  transition: "bottom 0.3s",
  position: "absolute",
  bottom: -50,
  display: "flex",
  width: "100%",
  alignItems: "center",
  paddingLeft: 16,
  paddingRight: 16,
  "@media (hover: none)": {
    bottom: 30,
  },
}))

export type SuccessTxViewProps = {
  txHash?: string
  action?: ReactNode
  amount: string
  symbol?: string
  collateral?: boolean
  rate?: InterestRate
  customAction?: ReactNode
  customText?: ReactNode
}

const ExtLinkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <ExternalLinkIcon />
  </SvgIcon>
)

const COPY_IMAGE_TIME = 5000

export const GhoBorrowSuccessView = ({
  txHash,
  action,
  amount,
  symbol,
}: SuccessTxViewProps) => {
  const [generatedImage, setGeneratedImage] = useState<string | undefined>()
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>()
  const [clickedCopyImage, setClickedCopyImage] = useState(false)
  const { mainTxState } = useModalContext()
  const { currentNetworkConfig } = useProtocolDataContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))
  const compactedNumber = compactNumber({
    value: amount,
    visibleDecimals: 2,
    roundDown: true,
  })
  const finalNumber = `${compactedNumber.prefix}${compactedNumber.postfix}`
  const canCopyImage = typeof ClipboardItem !== "undefined"

  const onCopyImage = () => {
    if (generatedBlob) {
      navigator.clipboard
        .write([
          new ClipboardItem({
            [generatedBlob.type]: generatedBlob,
          }),
        ])
        .then(() => {
          setClickedCopyImage(true)
          setTimeout(() => {
            setClickedCopyImage(false)
          }, COPY_IMAGE_TIME)
        })
    }
  }

  const transformImage = (svg: SVGSVGElement) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (context) {
        const img = new Image()
        img.onload = () => {
          document.fonts.ready.then(() => {
            context.drawImage(img, 0, 0)
            setGeneratedImage(canvasRef.current?.toDataURL("png", 1))
            canvasRef.current?.toBlob((blob) => setGeneratedBlob(blob), "png")
          })
        }
        img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg.outerHTML)}`
      }
    }
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "48px",
            height: "48px",
            bgcolor: "success.200",
            borderRadius: "50%",
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SvgIcon sx={{ color: "success.main", fontSize: "32px" }}>
            <CheckIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 4 }} variant="h2">
          <span>All done!</span>
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {action && amount && symbol && (
            <Typography>
              <span>
                You {action}{" "}
                <FormattedNumber
                  value={Number(amount)}
                  compact
                  variant="secondary14"
                />{" "}
                {symbol}
              </span>
            </Typography>
          )}
        </Box>
        <Button
          sx={{ mt: 4 }}
          variant="outlined"
          size="small"
          endIcon={<ExtLinkIcon style={{ fontSize: 12 }} />}
          href={currentNetworkConfig.explorerLinkBuilder({
            tx: txHash ? txHash : mainTxState.txHash,
          })}
          target="_blank"
        >
          <Typography variant="buttonS">
            <span>Review tx details</span>
          </Typography>
        </Button>
        <Typography sx={{ mt: 24, mb: 16 }} variant="h2">
          <span>Save and share</span>
        </Typography>
        <canvas
          style={{ display: "none" }}
          width={1169}
          height={900}
          ref={canvasRef}
        />
        {generatedImage && generatedBlob ? (
          <ImageContainer>
            <img
              src={generatedImage}
              alt="minted gho"
              style={{ maxWidth: "100%", borderRadius: "10px" }}
            />
            <ImageBar className="image-bar-gho">
              {canCopyImage ? (
                <CopyImageButton
                  disabled={clickedCopyImage}
                  onClick={onCopyImage}
                  sx={{
                    display: "flex",
                  }}
                  variant="outlined"
                  size="large"
                  startIcon={
                    clickedCopyImage ? (
                      <SvgIcon sx={{ color: "white", fontSize: 16 }}>
                        <CheckIcon />
                      </SvgIcon>
                    ) : (
                      <ContentCopyOutlined
                        style={{ fontSize: 16, fill: "white" }}
                      />
                    )
                  }
                >
                  <Typography variant="buttonS" color="white">
                    {clickedCopyImage ? (
                      <span>COPIED!</span>
                    ) : (
                      <span>COPY IMAGE</span>
                    )}
                  </Typography>
                </CopyImageButton>
              ) : (
                <CopyImageButton
                  download={"minted_gho.png"}
                  href={URL.createObjectURL(generatedBlob)}
                  sx={{
                    display: "flex",
                  }}
                  variant="outlined"
                  size="large"
                  startIcon={
                    clickedCopyImage ? (
                      <SvgIcon sx={{ color: "white", fontSize: 16 }}>
                        <CheckIcon />
                      </SvgIcon>
                    ) : (
                      <Download style={{ fontSize: 16, fill: "white" }} />
                    )
                  }
                >
                  <Typography variant="buttonS" color="white">
                    <span>Download</span>
                  </Typography>
                </CopyImageButton>
              )}
              <IconButtonCustom
                target="_blank"
                href={`https://hey.xyz/?url=${
                  window.location.href
                }&text=${`I just minted ${finalNumber} GHO`}&hashtags=Aave&preview=true`}
                size="small"
                sx={{ ml: "auto" }}
              >
                <HeyIcon sx={{ fill: "#845EEE" }} fontSize="small" />
              </IconButtonCustom>
              <IconButtonCustom
                target="_blank"
                href={`https://twitter.com/intent/tweet?text=I Just minted ${finalNumber} GHO`}
                sx={{ ml: 8 }}
              >
                <Twitter fontSize="small" sx={{ fill: "#33CEFF" }} />
              </IconButtonCustom>
            </ImageBar>
          </ImageContainer>
        ) : (
          <>
            <Skeleton
              height={downToXSM ? 240 : 286}
              sx={{ borderRadius: 4, width: "100%" }}
            />
            <div style={{ visibility: "hidden", position: "absolute" }}>
              <GhoSuccessImage
                onSuccessEditing={transformImage}
                text={finalNumber}
              />
            </div>
          </>
        )}
      </Box>
    </>
  )
}
