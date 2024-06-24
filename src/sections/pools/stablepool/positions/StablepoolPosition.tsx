import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SOmnipoolButton } from "./StablepoolPosition.styled"
import { STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { RemoveLiquidityButton } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityButton"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useRpcProvider } from "providers/rpcProvider"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import {
  Page,
  TransferModal,
} from "sections/pools/stablepool/transfer/TransferModal"
import { useState } from "react"
import { TStableSwap } from "api/assetDetails"
import { useMedia } from "react-use"
import { theme } from "theme"
import BN from "bignumber.js"
import { useRefetchAccountNFTPositions } from "api/deposits"
import { SPoolDetailsContainer } from "sections/pools/pool/details/PoolDetails.styled"

type Props = {
  pool: TPoolFullData
  amount: BN
  amountPrice: BN
}

export const StablepoolPosition = ({ pool, amount, amountPrice }: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const refetchPositions = useRefetchAccountNFTPositions()

  const [transferOpen, setTransferOpen] = useState<Page>()

  const meta = assets.getAsset(pool.id) as TStableSwap

  if (amount.isZero()) return null

  return (
    <SPoolDetailsContainer
      css={{ background: "transparent", height: ["auto", "auto"] }}
    >
      <div
        sx={{ flex: "row", align: "center", gap: 8, mb: [5, 20], mt: [5, 0] }}
      >
        <Icon
          size={15}
          sx={{ color: "vibrantBlue200" }}
          icon={<DropletIcon />}
        />
        <Text fs={[16, 16]} color="vibrantBlue200">
          {t("liquidity.stablepool.asset.positions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        <SContainer>
          <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
            <div sx={{ flex: "row", gap: 7, align: "center" }}>
              {meta.assets && (
                <MultipleIcons
                  size={26}
                  icons={meta.assets.map((assetId) => ({
                    icon: <AssetLogo key={assetId} id={assetId} />,
                  }))}
                />
              )}
            </div>
            <div
              sx={{
                flex: ["column", "row"],
                justify: "space-between",
                gap: [10, 0],
              }}
            >
              <div
                sx={{
                  flex: ["row", "column"],
                  gap: 6,
                  justify: "space-between",
                }}
              >
                <Text fs={[13, 14]} color="whiteish500">
                  {t("liquidity.stablepool.position.amount")}
                </Text>
                <div sx={{ flex: "column", align: ["end", "start"] }}>
                  <Text fs={[13, 16]}>
                    {t("value.token", {
                      value: amount,
                      fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                      numberSuffix: ` ${t(
                        "liquidity.stablepool.position.token",
                      )}`,
                    })}
                  </Text>
                  <DollarAssetValue
                    value={amountPrice}
                    wrapper={(children) => (
                      <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                        {children}
                      </Text>
                    )}
                  >
                    <DisplayValue value={amountPrice} />
                  </DollarAssetValue>
                </div>
              </div>

              <Separator orientation={isDesktop ? "vertical" : "horizontal"} />

              <div
                sx={{
                  flex: ["row", "column"],
                  gap: 6,
                  justify: "space-between",
                }}
              >
                <Text fs={[13, 14]} color="whiteish500">
                  {t("liquidity.asset.positions.position.currentValue")}
                </Text>

                <div sx={{ flex: "column", align: ["end", "start"] }}>
                  <Text fs={[13, 16]}>
                    {t("value.token", {
                      value: amount,
                      fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                    })}
                  </Text>
                  <DollarAssetValue
                    value={amountPrice}
                    wrapper={(children) => (
                      <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                        {children}
                      </Text>
                    )}
                  >
                    <DisplayValue value={amountPrice} />
                  </DollarAssetValue>
                </div>
              </div>
            </div>
          </div>
          <div
            sx={{
              flex: ["column", "row"],
              gap: 12,
            }}
          >
            <SOmnipoolButton
              size="small"
              fullWidth
              onClick={() => setTransferOpen(Page.MOVE_TO_OMNIPOOL)}
              disabled={!pool.canAddLiquidity}
            >
              <div sx={{ flex: "row", align: "center", justify: "center" }}>
                <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
                {t("liquidity.stablepool.addToOmnipool")}
              </div>
            </SOmnipoolButton>
            <RemoveLiquidityButton onSuccess={refetchPositions} pool={pool} />
          </div>
        </SContainer>
      </div>
      {transferOpen !== undefined && (
        <TransferModal
          pool={pool}
          isOpen
          defaultPage={transferOpen}
          onClose={() => setTransferOpen(undefined)}
        />
      )}
    </SPoolDetailsContainer>
  )
}
