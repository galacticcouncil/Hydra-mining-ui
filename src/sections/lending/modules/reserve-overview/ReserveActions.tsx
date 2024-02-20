import { API_ETH_MOCK_ADDRESS, InterestRate } from "@aave/contract-helpers"
import {
  BigNumberValue,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import { CircularProgress } from "@mui/material"
import WalletIcon from "assets/icons/WalletIcon.svg?react"
import BigNumber from "bignumber.js"
import { ReactNode, useState } from "react"
import Skeleton from "react-loading-skeleton"
import { getMarketInfoById } from "sections/lending/components/MarketSwitcher"
import { StyledTxModalToggleButton } from "sections/lending/components/StyledToggleButton"
import { StyledTxModalToggleGroup } from "sections/lending/components/StyledToggleButtonGroup"
import { ConnectWalletButton } from "sections/lending/components/WalletConnection/ConnectWalletButton"
import { Warning } from "sections/lending/components/primitives/Warning"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import { useModalContext } from "sections/lending/hooks/useModal"
import { usePermissions } from "sections/lending/hooks/usePermissions"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
//import { BuyWithFiat } from "sections/lending/modules/staking/BuyWithFiat"
import { useRootStore } from "sections/lending/store/root"
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { getMaxAmountAvailableToSupply } from "sections/lending/utils/getMaxAmountAvailableToSupply"
import { amountToUsd } from "sections/lending/utils/utils"

import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { useReserveActionState } from "sections/lending/hooks/useReserveActionState"
import { theme } from "theme"

const amountToUSD = (
  amount: BigNumberValue,
  formattedPriceInMarketReferenceCurrency: string,
  marketReferencePriceInUsd: string,
) => {
  return valueToBigNumber(amount)
    .multipliedBy(formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)
    .toString()
}

interface ReserveActionsProps {
  reserve: ComputedReserveData
}

export const ReserveActions = ({ reserve }: ReserveActionsProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string>(reserve.symbol)

  const { currentAccount, loading: loadingWeb3Context } = useWeb3Context()
  const { isPermissionsLoading } = usePermissions()
  const { openBorrow, openSupply } = useModalContext()
  const currentMarket = useRootStore((store) => store.currentMarket)
  const currentNetworkConfig = useRootStore(
    (store) => store.currentNetworkConfig,
  )
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const {
    ghoReserveData,
    user,
    loading: loadingReserves,
    marketReferencePriceInUsd,
  } = useAppDataContext()
  const { walletBalances, loading: loadingWalletBalance } =
    useWalletBalances(currentMarketData)

  const [minRemainingBaseTokenBalance, displayGho] = useRootStore((store) => [
    store.poolComputed.minRemainingBaseTokenBalance,
    store.displayGho,
  ])
  const { baseAssetSymbol } = currentNetworkConfig
  let balance = walletBalances[reserve.underlyingAsset]
  if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
    balance = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]
  }

  let maxAmountToBorrow = "0"
  let maxAmountToSupply = "0"
  const isGho = displayGho({ symbol: reserve.symbol, currentMarket })

  if (isGho) {
    const maxMintAmount = getMaxGhoMintAmount(user, reserve)
    maxAmountToBorrow = BigNumber.min(
      maxMintAmount,
      valueToBigNumber(ghoReserveData.aaveFacilitatorRemainingCapacity),
    ).toString()
    maxAmountToSupply = "0"
  } else {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(
      reserve,
      user,
      InterestRate.Variable,
    ).toString()

    maxAmountToSupply = getMaxAmountAvailableToSupply(
      balance?.amount || "0",
      reserve,
      reserve.underlyingAsset,
      minRemainingBaseTokenBalance,
    ).toString()
  }

  const maxAmountToBorrowUsd = amountToUsd(
    maxAmountToBorrow,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString()

  const maxAmountToSupplyUsd = amountToUSD(
    maxAmountToSupply,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString()

  const { disableSupplyButton, disableBorrowButton, alerts } =
    useReserveActionState({
      balance: balance?.amount || "0",
      maxAmountToSupply: maxAmountToSupply.toString(),
      maxAmountToBorrow: maxAmountToBorrow.toString(),
      reserve,
    })

  if (!currentAccount && !isPermissionsLoading) {
    return <ConnectWallet loading={loadingWeb3Context} />
  }

  if (loadingReserves || loadingWalletBalance) {
    return <ActionsSkeleton />
  }

  const onSupplyClicked = () => {
    if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
      openSupply(API_ETH_MOCK_ADDRESS.toLowerCase())
    } else {
      openSupply(reserve.underlyingAsset)
    }
  }

  const { market } = getMarketInfoById(currentMarket)

  return (
    <PaperWrapper>
      {reserve.isWrappedBaseAsset && (
        <div>
          <WrappedBaseAssetSelector
            assetSymbol={reserve.symbol}
            baseAssetSymbol={baseAssetSymbol}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />
        </div>
      )}
      <WalletBalance
        balance={balance.amount}
        symbol={selectedAsset}
        marketTitle={market.marketTitle}
      />
      {reserve.isFrozen || reserve.isPaused ? (
        <div sx={{ mt: 12 }}>
          {reserve.isPaused ? <PauseWarning /> : <FrozenWarning />}
        </div>
      ) : (
        <>
          <div sx={{ flex: "column", gap: 20 }}>
            {!isGho && (
              <SupplyAction
                reserve={reserve}
                value={maxAmountToSupply.toString()}
                usdValue={maxAmountToSupplyUsd}
                symbol={selectedAsset}
                disable={disableSupplyButton}
                onActionClicked={onSupplyClicked}
              />
            )}
            {reserve.borrowingEnabled && (
              <>
                <Spacer
                  size={1}
                  sx={{ bg: "darkBlue401", width: "100%" }}
                  axis="horizontal"
                />
                <BorrowAction
                  reserve={reserve}
                  value={maxAmountToBorrow.toString()}
                  usdValue={maxAmountToBorrowUsd}
                  symbol={selectedAsset}
                  disable={disableBorrowButton}
                  onActionClicked={() => {
                    openBorrow(reserve.underlyingAsset)
                  }}
                />
              </>
            )}
          </div>
          {alerts}
        </>
      )}
    </PaperWrapper>
  )
}

const PauseWarning = () => {
  return (
    <Warning sx={{ mb: 0 }} variant="error">
      <span>
        Because this asset is paused, no actions can be taken until further
        notice
      </span>
    </Warning>
  )
}

const FrozenWarning = () => {
  return (
    <Warning sx={{ mb: 0 }} variant="error">
      <span>
        Since this asset is frozen, the only available actions are withdraw and
        repay which can be accessed from the{" "}
        <Link href={ROUTES.dashboard}>Dashboard</Link>
      </span>
    </Warning>
  )
}

const ActionsSkeleton = () => {
  const RowSkeleton = (
    <div>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div>
          <Skeleton width={100} height={14} sx={{ mt: 4, mb: 8 }} />
          <Skeleton width={75} height={12} />
        </div>
        <Skeleton height={36} width={96} />
      </div>
    </div>
  )

  return (
    <PaperWrapper>
      <div sx={{ flex: "row", gap: 12, mb: 30 }}>
        <Skeleton width={42} height={42} />
        <div>
          <Skeleton width={100} height={12} sx={{ mt: 4, mb: 8 }} />
          <Skeleton width={100} height={14} />
        </div>
      </div>

      <div>
        <div sx={{ flex: "column", gap: 12 }}>
          {RowSkeleton}
          <Spacer
            size={1}
            sx={{ bg: "darkBlue401", width: "100%", my: 12 }}
            axis="horizontal"
          />
          {RowSkeleton}
        </div>
      </div>
    </PaperWrapper>
  )
}

const PaperWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div sx={{ color: "white" }}>
      <Text fs={15} sx={{ mb: 24 }} font="FontOver">
        Your info
      </Text>
      {children}
    </div>
  )
}

const ConnectWallet = ({ loading }: { loading: boolean }) => {
  return (
    <PaperWrapper>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Text fs={14} lh={18} sx={{ mb: 24 }} color="basic300">
            Please connect a wallet to view your personal information here.
          </Text>
          <ConnectWalletButton />
        </>
      )}
    </PaperWrapper>
  )
}

interface ActionProps {
  value: string
  usdValue: string
  symbol: string
  disable: boolean
  onActionClicked: () => void
  reserve: ComputedReserveData
}

const SupplyAction = ({
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", justify: "space-between" }}>
      <DataValue
        label="Available to supply"
        font="ChakraPetchSemiBold"
        size="small"
        tooltip="This is the total amount that you are able to supply to in this reserve. You are able to supply your wallet balance up until the supply cap is reached."
      >
        {t("value.token", { value: Number(value) })} {symbol}
        <Text fs={12} lh={20} color="basic500">
          <DisplayValue value={+usdValue} isUSD compact />
        </Text>
      </DataValue>
      <div css={{ minWidth: 90 }}>
        <Button
          fullWidth
          size="small"
          onClick={onActionClicked}
          disabled={disable}
        >
          Supply
        </Button>
      </div>
    </div>
  )
}

const BorrowAction = ({
  reserve,
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", justify: "space-between" }}>
      <DataValue
        label="Available to borrow"
        font="ChakraPetchSemiBold"
        size="small"
        tooltip="This is the total amount available for you to borrow. You can borrow based on your collateral and until the borrow cap is reached."
      >
        {t("value.token", { value: Number(value) })} {symbol}
        <Text fs={12} lh={20} color="basic500">
          <DisplayValue value={+usdValue} isUSD compact />
        </Text>
      </DataValue>
      <div css={{ minWidth: 90 }}>
        <Button
          fullWidth
          size="small"
          onClick={onActionClicked}
          disabled={disable}
        >
          Borrow
        </Button>
      </div>
    </div>
  )
}

const WrappedBaseAssetSelector = ({
  assetSymbol,
  baseAssetSymbol,
  selectedAsset,
  setSelectedAsset,
}: {
  assetSymbol: string
  baseAssetSymbol: string
  selectedAsset: string
  setSelectedAsset: (value: string) => void
}) => {
  return (
    <StyledTxModalToggleGroup
      color="primary"
      value={selectedAsset}
      exclusive
      onChange={(_, value) => setSelectedAsset(value)}
      sx={{ mb: 4 }}
    >
      <StyledTxModalToggleButton value={assetSymbol}>
        <Text>{assetSymbol}</Text>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton value={baseAssetSymbol}>
        <Text>{baseAssetSymbol}</Text>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  )
}

interface WalletBalanceProps {
  balance: string
  symbol: string
  marketTitle: string
}
const WalletBalance = ({ balance, symbol }: WalletBalanceProps) => {
  const { t } = useTranslation()

  return (
    <div
      sx={{ flex: "row", gap: 12, align: "center", p: 16, mb: 20 }}
      css={{
        background: `rgba(${theme.rgbColors.alpha0}, 0.06)`,
        borderRadius: theme.borderRadius.medium,
        border: `1px solid rgba(${theme.rgbColors.primaryA0}, 0.35)`,
      }}
    >
      <WalletIcon width={24} height={24} />
      <div>
        <DataValue
          label="Wallet Balance"
          font="ChakraPetchSemiBold"
          size="small"
          labelColor="basic400"
        >
          {t("value.token", { value: Number(balance) })} {symbol}
        </DataValue>
      </div>
    </div>
  )
}
