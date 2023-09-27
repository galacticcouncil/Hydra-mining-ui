import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { Trans, useTranslation } from "react-i18next"
import {
  SButton,
  SContainer,
} from "sections/pools/pool/positions/LiquidityPosition.styled"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { useState } from "react"
import { RemoveLiquidity } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity"
import { Button } from "components/Button/Button"
import { ReactComponent as FPIcon } from "assets/icons/PoolsAndFarms.svg"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useFarms } from "api/farms"
import { useFarmDepositMutation } from "utils/farms/deposit"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccountStore } from "state/store"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { BN_0 } from "utils/constants"
import Skeleton from "react-loading-skeleton"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  pool: OmnipoolPool
  position: HydraPositionsTableData
  onSuccess: () => void
  index: number
}

function LiquidityPositionJoinFarmButton(props: {
  pool: OmnipoolPool
  position: HydraPositionsTableData
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
  const [joinFarm, setJoinFarm] = useState(false)
  const farms = useFarms([props.pool.id])
  const meta = assets.getAsset(props.pool.id.toString())

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.join.toast.${msType}`}
        tOptions={{
          amount: props.position.shares,
          fixedPointScale: meta.decimals,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const joinFarmMutation = useFarmDepositMutation(
    props.pool.id,
    props.position.id,
    toast,
    () => setJoinFarm(false),
  )

  return (
    <>
      <Button
        variant="primary"
        size="small"
        disabled={!farms.data?.length || account?.isExternalWalletConnected}
        sx={{ width: ["100%", 220] }}
        onClick={() => setJoinFarm(true)}
      >
        <Icon size={16} icon={<FPIcon />} />
        {t("liquidity.asset.actions.joinFarms")}
      </Button>

      {joinFarm && farms.data && (
        <JoinFarmModal
          farms={farms.data}
          isOpen={joinFarm}
          pool={props.pool}
          shares={props.position.shares}
          onClose={() => setJoinFarm(false)}
          mutation={joinFarmMutation}
        />
      )}
    </>
  )
}

function LiquidityPositionRemoveLiquidity(props: {
  position: HydraPositionsTableData
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [openRemove, setOpenRemove] = useState(false)
  return (
    <>
      <SButton
        variant="secondary"
        size="small"
        onClick={() => setOpenRemove(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </SButton>
      {openRemove && (
        <RemoveLiquidity
          isOpen={openRemove}
          onClose={() => setOpenRemove(false)}
          position={props.position}
          onSuccess={props.onSuccess}
        />
      )}
    </>
  )
}

export const LiquidityPosition = ({
  pool,
  position,
  index,
  onSuccess,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const meta = assets.getAsset(position.assetId)
  const price = useDisplayPrice(meta.id)

  const shiftBy = meta.decimals
  const spotPrice = price.data?.spotPrice
  const providedAmountPrice = spotPrice
    ? position.providedAmount.multipliedBy(spotPrice).shiftedBy(-shiftBy)
    : BN_0

  const providedAmountPriceLoading = price.isLoading

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", gap: 7, align: "center" }}>
          <Icon size={18} icon={<AssetLogo id={position.assetId} />} />
          <Text fs={[14, 18]} color={["white", "basic100"]}>
            {t("liquidity.asset.positions.position.title", { index })}
          </Text>
        </div>
        <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div sx={{ flex: "column", gap: 6 }}>
            <Text fs={14} color="whiteish500">
              {t("liquidity.asset.positions.position.initialValue")}
            </Text>
            <div>
              <Text>
                {t("value.token", {
                  value: position.providedAmount,
                  fixedPointScale: meta.decimals,
                  numberSuffix: meta.symbol,
                })}
              </Text>
              {providedAmountPriceLoading ? (
                <Skeleton width={50} height={7} />
              ) : (
                <DollarAssetValue
                  value={providedAmountPrice}
                  wrapper={(children) => (
                    <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                      {children}
                    </Text>
                  )}
                >
                  <DisplayValue value={providedAmountPrice} />
                </DollarAssetValue>
              )}
            </div>
          </div>
          <Separator orientation="vertical" />
          <div sx={{ flex: "column", gap: 6 }}>
            <div sx={{ display: "flex", gap: 6 }}>
              <Text fs={14} color="whiteish500">
                {t("liquidity.asset.positions.position.currentValue")}
              </Text>
              <LrnaPositionTooltip
                assetId={position.assetId}
                tokenPosition={position.value}
                lrnaPosition={position.lrna}
              />
            </div>
            <div sx={{ flex: "column", align: "start" }}>
              <WalletAssetsHydraPositionsData
                symbol={position.symbol}
                value={position.value}
                lrna={position.lrna}
              />
              <DollarAssetValue
                value={position.valueDisplay}
                wrapper={(children) => (
                  <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={position.valueDisplay} />
              </DollarAssetValue>
            </div>
          </div>
        </div>
      </div>
      <div
        sx={{
          flex: "column",
          align: "end",
          gap: 8,
        }}
      >
        {import.meta.env.VITE_FF_FARMS_ENABLED === "true" && (
          <LiquidityPositionJoinFarmButton
            pool={pool}
            position={position}
            onSuccess={onSuccess}
          />
        )}
        <LiquidityPositionRemoveLiquidity
          position={position}
          onSuccess={onSuccess}
        />
      </div>
    </SContainer>
  )
}
