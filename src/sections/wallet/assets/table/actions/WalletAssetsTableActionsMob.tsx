import { Link } from "@tanstack/react-location"
import { useSetAsFeePayment } from "api/payments"
import TradeIcon from "assets/icons/Fill.svg?react"
import DollarIcon from "assets/icons/DollarIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { LINKS } from "utils/navigation"
import {
  SActionButtonsContainer,
  SGridContainer,
} from "./WalletAssetsTable.styled"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import {
  AssetsTableData,
  useLockedNativeTokens,
  useUnlockableTokens,
  useUnlockTokens,
} from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import Skeleton from "react-loading-skeleton"
import {
  AddTokenAction,
  UpdateTokenDataAction,
} from "./WalletAssetsTableActions"
import { isEvmAccount } from "utils/evm"
import { createToastMessages } from "state/toasts"
import BN, { BigNumber } from "bignumber.js"
import { BN_NAN } from "utils/constants"
import { SLocksContainer } from "sections/wallet/assets/table/details/WalletAssetsTableDetails.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useState } from "react"
import { ExternalAssetUpdateModal } from "sections/trade/modal/ExternalAssetUpdateModal"
import InfoIcon from "assets/icons/InfoIcon.svg?react"
import { useAssets } from "providers/assets"

type Props = {
  row?: AssetsTableData
  onClose: () => void
  onTransferClick: (id: string) => void
}

export const WalletAssetsTableActionsMob = ({
  row,
  onClose,
  onTransferClick,
}: Props) => {
  const { t } = useTranslation()
  const { native } = useAssets()
  const { account } = useAccount()
  const feeAsPayment = useSetAsFeePayment()
  const { featureFlags } = useRpcProvider()
  const [assetCheckModalOpen, setAssetCheckModalOpen] = useState(false)

  if (!row) return null

  const isNativeAsset = row.id === native.id

  const displayFeePaymentAssetButton = isEvmAccount(account?.address)
    ? featureFlags.dispatchPermit
    : true

  const isUnknownExternalAsset = row.isExternalInvalid

  const rugCheckData = row.rugCheckData
  const hasRugCheckData = !!rugCheckData
  const hasRugCheckWarnings = !!rugCheckData?.warnings?.length

  return (
    <Modal open={!!row} isDrawer onClose={onClose} title="">
      <div>
        <div sx={{ pb: 30 }}>
          <AssetTableName {...row} large />
        </div>
        <Separator
          css={{ background: `rgba(${theme.rgbColors.alpha0}, 0.06)` }}
        />
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            py: 30,
            flexWrap: "wrap",
          }}
        >
          {hasRugCheckWarnings ? (
            <>
              <Text fs={13} color="warningOrange200" sx={{ p: 8 }}>
                {t("wallet.assets.table.addToken.changed")}
              </Text>{" "}
            </>
          ) : isUnknownExternalAsset ? (
            <Text fs={13} color="whiteish500" sx={{ p: 8 }}>
              {t("wallet.assets.table.addToken.unknown")}
            </Text>
          ) : (
            <>
              <div sx={{ flex: "column", gap: 4 }}>
                <Text fs={14} lh={16} color="whiteish500">
                  {t("wallet.assets.table.header.total")}
                </Text>
                <Text fs={14} lh={14} color="white">
                  {t("value.token", { value: row.total })}
                </Text>
                <Text fs={12} lh={17} color="whiteish500">
                  <DisplayValue value={BN(row.totalDisplay ?? BN_NAN)} />
                </Text>
              </div>

              <div sx={{ flex: "column", gap: 4 }}>
                <Text fs={14} lh={16} color="whiteish500">
                  {t("wallet.assets.table.header.transferable")}
                </Text>
                <Text fs={14} lh={14} color="white">
                  {t("value.token", { value: row.transferable })}
                </Text>
                <Text fs={12} lh={12} color="whiteish500">
                  <DisplayValue value={BN(row.transferableDisplay ?? BN_NAN)} />
                </Text>
              </div>
            </>
          )}
        </div>
        <SActionButtonsContainer>
          {hasRugCheckWarnings ? (
            <UpdateTokenDataAction
              id={row.id}
              css={{ width: "100%", marginTop: 20 }}
            />
          ) : isUnknownExternalAsset ? (
            <AddTokenAction
              id={row.id}
              css={{ width: "100%", marginTop: 20 }}
              onClose={onClose}
            />
          ) : (
            <>
              {isNativeAsset ? (
                <NativeLocks
                  reserved={row.reserved}
                  reservedDisplay={row.reservedDisplay}
                />
              ) : (
                <Locks
                  reserved={row.reserved}
                  reservedDisplay={row.reservedDisplay}
                />
              )}
              <div sx={{ flex: "column", gap: 12, px: 8 }}>
                <Link
                  to={LINKS.swap}
                  search={
                    row.tradability.canBuy
                      ? { assetOut: row.id }
                      : { assetIn: row.id }
                  }
                  disabled={
                    !row.tradability.inTradeRouter ||
                    account?.isExternalWalletConnected
                  }
                  sx={{ width: "100%" }}
                >
                  <Button
                    sx={{ width: "100%" }}
                    size="small"
                    disabled={
                      !row.tradability.inTradeRouter ||
                      account?.isExternalWalletConnected
                    }
                  >
                    <TradeIcon />
                    {t("wallet.assets.table.actions.trade")}
                  </Button>
                </Link>

                <Button
                  sx={{ width: "100%" }}
                  size="small"
                  disabled={account?.isExternalWalletConnected}
                  onClick={() => onTransferClick(row.id)}
                >
                  <TransferIcon />
                  {t("wallet.assets.table.actions.transfer")}
                </Button>

                {hasRugCheckData && (
                  <>
                    <Button
                      sx={{ width: "100%" }}
                      size="small"
                      onClick={() => setAssetCheckModalOpen(true)}
                    >
                      <InfoIcon width={18} height={18} />
                      {t("wallet.assets.table.actions.checkExternal")}
                    </Button>
                    {assetCheckModalOpen && (
                      <ExternalAssetUpdateModal
                        open={assetCheckModalOpen}
                        assetId={row.id}
                        onClose={() => {
                          setAssetCheckModalOpen(false)
                        }}
                      />
                    )}
                  </>
                )}

                {displayFeePaymentAssetButton && (
                  <Button
                    sx={{ width: "100%" }}
                    size="small"
                    onClick={() => feeAsPayment.mutate(row.id)}
                    disabled={
                      !row.couldBeSetAsPaymentFee ||
                      account?.isExternalWalletConnected
                    }
                  >
                    <DollarIcon />
                    {t("wallet.assets.table.actions.payment.asset")}
                  </Button>
                )}
              </div>
            </>
          )}
        </SActionButtonsContainer>
      </div>
    </Modal>
  )
}

const NativeLocks = ({
  reserved,
  reservedDisplay,
}: {
  reserved: string
  reservedDisplay?: string
}) => {
  const { account } = useAccount()
  const { t } = useTranslation()
  const lockedTokens = useLockedNativeTokens()
  const unlocable = useUnlockableTokens()

  const unlockedIdsAmount = unlocable.ids.length + unlocable.openGovIds.length
  const isUnlockDisabled = !unlockedIdsAmount && unlocable.unlockedValue === "0"

  const toast = createToastMessages(
    `wallet.assets.table.details.${unlocable.unlockedValue === "0" ? "clear" : "unlock"}`,
    {
      t,
      tOptions: {
        amount: unlockedIdsAmount,
        value: BigNumber(unlocable.unlockedValue),
      },
    },
  )

  const unlock = useUnlockTokens({
    ids: unlocable.ids,
    openGovIds: unlocable.openGovIds,
    toast,
  })
  const title = !unlockedIdsAmount
    ? t("wallet.assets.table.details.unlock")
    : t("wallet.assets.table.details.clear")

  return (
    <SGridContainer sx={{ pt: 20, pb: 10, gap: 8 }}>
      <div
        sx={{
          flex: "column",
          gap: 4,
          pr: 10,
        }}
      >
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.lockedStaking")}
        </Text>
        {lockedTokens.isLoading ? (
          <Skeleton height={14} width={40} />
        ) : (
          <Text fs={14} lh={14} color="white">
            {t("value", { value: lockedTokens.lockStaking })}
          </Text>
        )}
        {lockedTokens.isLoading ? (
          <Skeleton height={12} width={30} />
        ) : (
          <Text fs={12} lh={12} color="whiteish500">
            <DisplayValue value={lockedTokens.lockStakingDisplay} />
          </Text>
        )}
      </div>

      <div
        sx={{
          flex: "column",
          gap: 4,
        }}
      >
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.lockedDemocracy")}
        </Text>
        {lockedTokens.isLoading ? (
          <Skeleton height={14} width={40} />
        ) : (
          <Text fs={14} lh={14} color="white">
            {t("value", { value: lockedTokens.lockDemocracy })}
          </Text>
        )}
        {lockedTokens.isLoading ? (
          <Skeleton height={12} width={30} />
        ) : (
          <Text fs={12} lh={12} color="whiteish500">
            <DisplayValue value={lockedTokens.lockDemocracyDisplay} />
          </Text>
        )}
        {unlocable.endDate ? (
          <SLocksContainer sx={{ width: "fit-content" }}>
            <Text fs={11} lh={15} color="darkBlue200">
              {t("wallet.assets.table.details.expiring", {
                duration: unlocable.endDate,
              })}
            </Text>
          </SLocksContainer>
        ) : null}
      </div>

      <div
        sx={{
          flex: "column",
          gap: 4,
          pr: 10,
        }}
      >
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.lockedReferenda")}
        </Text>
        {lockedTokens.isLoading ? (
          <Skeleton height={14} width={40} />
        ) : (
          <Text fs={14} lh={14} color="white">
            {t("value.token", { value: lockedTokens.lockOpenGov })}
          </Text>
        )}
        {lockedTokens.isLoading ? (
          <Skeleton height={12} width={30} />
        ) : (
          <Text fs={12} lh={12} color="whiteish500">
            <DisplayValue value={lockedTokens.lockOpenGovDisplay} />
          </Text>
        )}
        {unlocable.openGovEndDate ? (
          <SLocksContainer sx={{ width: "fit-content" }}>
            <Text fs={11} lh={15} color="darkBlue200">
              {t("wallet.assets.table.details.expiring", {
                duration: unlocable.openGovEndDate,
              })}
            </Text>
          </SLocksContainer>
        ) : null}
      </div>

      <div
        sx={{
          flex: "column",
          gap: 4,
        }}
      >
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.unlockable")}
        </Text>

        <Text fs={14} lh={14} color="white">
          {unlocable.isLoading ? (
            <Skeleton height={14} width={30} />
          ) : (
            t("value.token", { value: BigNumber(unlocable.unlockedValue) })
          )}
        </Text>
        <Text fs={12} lh={12} color="whiteish500">
          {unlocable.isLoading ? (
            <Skeleton height={10} width={20} />
          ) : (
            <DisplayValue value={BigNumber(unlocable.unlockedDisplayValue)} />
          )}
        </Text>
        {unlockedIdsAmount ? (
          <SLocksContainer>
            <Text fs={11} lh={15} color="darkBlue200">
              {t("wallet.assets.table.details.expired", {
                count: unlockedIdsAmount,
              })}
            </Text>
          </SLocksContainer>
        ) : null}
      </div>

      <div sx={{ flex: "column", gap: 4, pr: 10, flexBasis: "50%" }}>
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={14} lh={14} color="white">
          {t("value.token", { value: BN(reserved) })}
        </Text>
        <Text fs={12} lh={12} color="whiteish500">
          <DisplayValue value={BN(reservedDisplay ?? BN_NAN)} />
        </Text>
      </div>

      <div sx={{ flex: "column", gap: 4 }}>
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.lockedVesting")}
        </Text>
        {lockedTokens.isLoading ? (
          <Skeleton height={14} width={40} />
        ) : (
          <Text fs={14} lh={14} color="white">
            {t("value", { value: lockedTokens.lockVesting })}
          </Text>
        )}
        {lockedTokens.isLoading ? (
          <Skeleton height={12} width={30} />
        ) : (
          <Text fs={12} lh={12} color="whiteish500">
            <DisplayValue value={lockedTokens.lockVestingDisplay} />
          </Text>
        )}
      </div>
      <Button
        variant="primary"
        size="small"
        disabled={
          account?.isExternalWalletConnected ||
          isUnlockDisabled ||
          unlock.isLoading
        }
        onClick={() => unlock.mutate()}
        isLoading={unlock.isLoading}
        sx={{ mx: 8, mt: 12 }}
        css={{ gridColumn: "span 2" }}
      >
        {title}
      </Button>
    </SGridContainer>
  )
}

const Locks = ({
  reserved,
  reservedDisplay,
}: {
  reserved: string
  reservedDisplay?: string
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", flexWrap: "wrap", py: 20 }}>
      <div sx={{ flex: "column", gap: 4, pr: 10, flexBasis: "50%" }}>
        <Text fs={14} lh={16} color="whiteish500">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={14} lh={14} color="white">
          {t("value.token", { value: BN(reserved) })}
        </Text>
        <Text fs={12} lh={12} color="whiteish500">
          <DisplayValue value={BN(reservedDisplay ?? BN_NAN)} />
        </Text>
      </div>
    </div>
  )
}
