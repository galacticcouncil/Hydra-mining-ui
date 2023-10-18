import { SContainer, SGridContainer } from "sections/pools/pool/Pool.styled"
import { PoolValue } from "./details/PoolValue"
import { PoolActions } from "./actions/PoolActions"
import { Stablepool as StablepoolType } from "sections/pools/PoolsPage.utils"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { LiquidityPosition } from "./positions/LiquidityPosition"
import { useTokenBalance } from "api/balances"
import { useAccountStore } from "state/store"
import { BN_0 } from "utils/constants"
import { TransferModal, Page } from "./transfer/TransferModal"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolCapacity } from "sections/pools/pool/capacity/PoolCapacity"

type Props = {
  pool: StablepoolType
}

export const StablePool = ({
  pool: { id, fee, assets, total, balanceByAsset, reserves, totalDisplay },
}: Props) => {
  const [transferOpen, setTransferOpen] = useState<Page>()
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { account } = useAccountStore()
  const position = useTokenBalance(id.toString(), account?.address)
  const positions = usePoolPositions(id)

  const amount = position?.data?.freeBalance ?? BN_0
  const hasPosition = amount.isGreaterThan(BN_0) || !!positions.data?.length

  return (
    <SContainer id={id.toString()}>
      <SGridContainer>
        <PoolDetails id={id} css={{ gridArea: "details" }} />
        <PoolValue
          totalDisplay={totalDisplay}
          total={total.value}
          css={{ gridArea: "values" }}
        />
        <PoolActions
          poolId={id}
          assets={assets}
          fee={fee}
          css={{ gridArea: "actions" }}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
          isExpanded={isExpanded}
          canExpand={hasPosition}
          refetchPositions={position.refetch}
          reserves={reserves}
          amount={amount}
          onTransferOpen={() => setTransferOpen(Page.OPTIONS)}
        />
        <PoolCapacity id={id.toString()} css={{ gridArea: "capacity" }} />
      </SGridContainer>
      {transferOpen !== undefined && (
        <TransferModal
          poolId={id}
          assets={assets}
          fee={fee}
          isOpen={true}
          defaultPage={transferOpen}
          reserves={reserves}
          onClose={() => setTransferOpen(undefined)}
          balanceByAsset={balanceByAsset}
          refetchPositions={position.refetch}
        />
      )}
      {isDesktop && hasPosition && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              <LiquidityPosition
                poolId={id}
                assets={assets}
                amount={amount}
                fee={fee}
                reserves={reserves}
                refetchPosition={position.refetch}
                onTransferOpen={() => setTransferOpen(Page.MOVE_TO_OMNIPOOL)}
              />
              <LiquidityPositionWrapper poolId={id} positions={positions} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </SContainer>
  )
}
