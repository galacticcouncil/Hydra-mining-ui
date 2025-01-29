import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { AddLiquidityForm } from "./AddLiquidityForm"
import { isXYKPoolType } from "sections/pools/PoolsPage.utils"
import { AddLiquidityFormXYK } from "./AddLiquidityFormXYK"
import { usePoolData } from "sections/pools/pool/Pool"
import { LimitModal } from "./components/LimitModal/LimitModal"

export enum Page {
  ADD_LIQUIDITY,
  ASSET_SELECTOR,
  LIMIT_LIQUIDITY,
}

type AddLiquidityProps = {
  isOpen: boolean
  onClose: () => void
}

export const AddLiquidity = ({ isOpen, onClose }: AddLiquidityProps) => {
  const { pool } = usePoolData()
  const { t } = useTranslation()
  const { page, direction, back, paginateTo } = useModalPagination()
  const [assetId, setAssetId] = useState(pool.id)

  const farms = pool.farms
  const isXYK = isXYKPoolType(pool)

  return (
    <Modal open={isOpen} disableCloseOutside onClose={onClose}>
      <ModalContents
        disableAnimation
        page={page}
        direction={direction}
        onClose={onClose}
        onBack={
          page === Page.LIMIT_LIQUIDITY
            ? () => paginateTo(Page.ADD_LIQUIDITY)
            : undefined
        }
        contents={[
          {
            title: t("liquidity.add.modal.title"),
            content: isXYK ? (
              <AddLiquidityFormXYK pool={pool} onClose={onClose} />
            ) : (
              <AddLiquidityForm
                assetId={assetId}
                farms={farms}
                onClose={onClose}
                setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <AssetsModalContent
                defaultSelectedAsssetId={pool.id}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  back()
                }}
              />
            ),
          },
          {
            title: t("liquidity.add.modal.limit.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <LimitModal onConfirm={() => paginateTo(Page.ADD_LIQUIDITY)} />
            ),
          },
        ]}
      />
    </Modal>
  )
}
