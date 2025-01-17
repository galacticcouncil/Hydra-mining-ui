import { createLazyFileRoute } from "@tanstack/react-router"

import { WalletAssetsPage } from "@/modules/wallet/WalletAssetsPage"

export const Route = createLazyFileRoute("/_wallet/wallet/assets")({
  component: WalletAssetsPage,
})
