import { useCallback, useState } from "react"
import { AssetsModalContent } from "./AssetsModal"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/helpers"
import { UseAssetModel } from "api/asset"

interface useAssetsModalProps {
  onSelect?: (asset: NonNullable<UseAssetModel>) => void
  allowedAssets?: Maybe<u32 | string>[]
  title?: string
  hideInactiveAssets?: boolean
  allAssets?: boolean
}

export const useAssetsModal = ({
  onSelect,
  allowedAssets,
  title,
  hideInactiveAssets,
  allAssets,
}: useAssetsModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleSelect = useCallback(
    (asset: NonNullable<UseAssetModel>) => {
      setIsOpen(false)
      onSelect?.(asset)
    },
    [onSelect],
  )

  const modal = isOpen ? (
    <AssetsModalContent
      title={title}
      onClose={() => setIsOpen(false)}
      onSelect={handleSelect}
      allowedAssets={allowedAssets}
      hideInactiveAssets={hideInactiveAssets}
      allAssets={allAssets}
    />
  ) : null

  return {
    openModal,
    modal,
    isOpen,
  }
}
