import { Button } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { bestNumberQuery } from "@/api/chain"
import { RpcSelectModal } from "@/components/ProviderRpcSelect/components/RpcSelectModal"
import { RpcStatus } from "@/components/ProviderRpcSelect/components/RpcStatus"
import { useRpcProvider } from "@/providers/rpcProvider"

export const ProviderRpcSelect = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const provider = useRpcProvider()

  const { data } = useQuery(bestNumberQuery(provider))

  return (
    <>
      <Button
        sx={{
          position: "fixed",
          bottom: 10,
          right: 10,
          color: "successGreen.500",
        }}
        variant="tertiary"
        size="small"
        outline
        onClick={() => setModalOpen(true)}
      >
        {data && (
          <RpcStatus
            blockNumber={data.parachainBlockNumber}
            timestamp={data.timestamp}
          />
        )}
      </Button>
      <RpcSelectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
