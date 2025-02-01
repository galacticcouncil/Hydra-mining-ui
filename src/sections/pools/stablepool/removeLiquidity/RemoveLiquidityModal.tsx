import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { useTranslation } from "react-i18next"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { getStepState, Stepper } from "components/Stepper/Stepper"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { RemoveLiquidityForm } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidityForm"
import { RemoveStablepoolLiquidityForm } from "./RemoveLiquidityForm"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { RemoveOption, RemoveOptions } from "./RemoveOptions"
import { Button } from "components/Button/Button"
import BN from "bignumber.js"
import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner"
import { TLPData } from "utils/omnipool"
import { useRefetchAccountAssets } from "api/deposits"

enum RemoveStablepoolLiquidityPage {
  OPTIONS,
  REMOVE_FROM_OMNIPOOL,
  WAIT,
  REMOVE_FROM_STABLEPOOL,
  ASSETS,
}

type RemoveStableSwapAssetProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  pool: TPoolFullData
  position?: TLPData | TLPData[]
}

export const RemoveLiquidityModal = ({
  isOpen,
  onClose,
  onSuccess,
  pool,
  position,
}: RemoveStableSwapAssetProps) => {
  const stableSwapMeta = pool.meta
  const assets = Object.keys(stableSwapMeta.meta ?? {})
  const refetch = useRefetchAccountAssets()

  const isRemovingOmnipoolPosition = !!position

  const stablepoolPosition = pool.balance
  const stablepoolPositionAmount = stablepoolPosition?.freeBalance ?? "0"

  const { t } = useTranslation()
  const { page, direction, paginateTo } = useModalPagination(
    isRemovingOmnipoolPosition
      ? RemoveStablepoolLiquidityPage.OPTIONS
      : RemoveStablepoolLiquidityPage.REMOVE_FROM_STABLEPOOL,
  )

  const [assetId, setAssetId] = useState<string | undefined>(assets[0])
  const [selectedOption, setSelectedOption] = useState<RemoveOption>("SHARES")
  const [sharesAmount, setSharesAmount] = useState<string>()
  const [removeAll, setRemoveAll] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [splitRemove, setSplitRemove] = useState(true)

  const handleBack = () => {
    if (page === RemoveStablepoolLiquidityPage.ASSETS) {
      return paginateTo(RemoveStablepoolLiquidityPage.REMOVE_FROM_STABLEPOOL)
    }

    if (page === RemoveStablepoolLiquidityPage.REMOVE_FROM_STABLEPOOL) {
      return paginateTo(RemoveStablepoolLiquidityPage.REMOVE_FROM_OMNIPOOL)
    }

    paginateTo(page - 1)
    setCurrentStep((step) => step - 1)
  }

  const steps = [
    t("liquidity.stablepool.remove.options"),
    t("liquidity.stablepool.remove.omnipool"),
    t("liquidity.stablepool.remove.removing"),
    t("liquidity.stablepool.remove.stablepool"),
  ]

  const canGoBack =
    isRemovingOmnipoolPosition || page === RemoveStablepoolLiquidityPage.ASSETS

  if (!assetId || !pool.stablepoolFee || !assets.length) return null

  return (
    <Modal
      open={isOpen}
      disableCloseOutside={true}
      onClose={onClose}
      topContent={
        page && selectedOption === "STABLE" ? (
          <Stepper
            sx={{ px: [10] }}
            steps={steps.map((step, idx) => ({
              label: step,
              state: getStepState(idx, currentStep),
            }))}
          />
        ) : null
      }
    >
      <ModalContents
        direction={direction}
        onClose={() => {
          onClose()
          onSuccess()
        }}
        page={page}
        onBack={canGoBack ? handleBack : undefined}
        contents={[
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <>
                <RemoveOptions
                  selected={selectedOption}
                  onSelect={setSelectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => {
                    paginateTo(
                      RemoveStablepoolLiquidityPage.REMOVE_FROM_OMNIPOOL,
                    )
                    setCurrentStep((step) => step + 1)
                  }}
                >
                  {t("next")}
                </Button>
              </>
            ),
          },
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: position && (
              <RemoveLiquidityForm
                onClose={() => {
                  if (selectedOption === "STABLE") {
                    return
                  }
                  onSuccess()
                  onClose()
                }}
                onError={onClose}
                position={position}
                onSubmitted={(shares) => {
                  if (selectedOption === "STABLE") {
                    if (BN(stablepoolPositionAmount).isZero()) {
                      setRemoveAll(true)
                      setSharesAmount(shares)
                    } else {
                      setSharesAmount(shares)
                    }

                    paginateTo(RemoveStablepoolLiquidityPage.WAIT)
                    setCurrentStep((step) => step + 1)
                  }
                }}
                onSuccess={() => {
                  if (selectedOption === "STABLE") {
                    refetch()
                    setCurrentStep((step) => step + 1)
                    paginateTo(
                      RemoveStablepoolLiquidityPage.REMOVE_FROM_STABLEPOOL,
                    )
                  } else {
                    onSuccess()
                  }
                }}
              />
            ),
          },
          {
            title: t("liquidity.stablepool.remove.removing"),
            headerVariant: "gradient",
            content: (
              <div
                sx={{
                  flex: "column",
                  gap: 50,
                  align: "center",
                  justify: "center",
                  height: 240,
                }}
              >
                <Spinner size={50} />
                <Text color="whiteish500">
                  {t("liquidity.stablepool.remove.removing")}
                </Text>
              </div>
            ),
          },
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <RemoveStablepoolLiquidityForm
                defaultValue={isRemovingOmnipoolPosition ? 100 : 25}
                assetId={assetId}
                onClose={onClose}
                position={{
                  reserves: pool.reserves,
                  fee: pool.stablepoolFee,
                  poolId: pool.id,
                  amount:
                    isRemovingOmnipoolPosition && !removeAll
                      ? BN(sharesAmount ?? 0)
                      : BN(stablepoolPositionAmount),
                }}
                onSuccess={() => {
                  onSuccess()
                  refetch()
                }}
                onAssetOpen={() =>
                  paginateTo(RemoveStablepoolLiquidityPage.ASSETS)
                }
                splitRemove={splitRemove}
                setSplitRemove={setSplitRemove}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                allAssets={true}
                hideInactiveAssets={true}
                allowedAssets={assets}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  handleBack()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
