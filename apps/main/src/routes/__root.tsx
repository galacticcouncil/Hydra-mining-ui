import { QueryClient, useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  ScrollRestoration,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { assetsQuery } from "@/api/assets"
import { ProviderRpcSelect } from "@/components/ProviderRpcSelect/ProviderRpcSelect"
import { MainLayout } from "@/modules/layout/MainLayout"
import { useRpcProvider } from "@/providers/rpcProvider"

const Subscriptions = () => {
  const rpcProvider = useRpcProvider()

  useQuery(assetsQuery(rpcProvider))

  return null
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  const { isApiLoaded } = useRpcProvider()

  return (
    <>
      <MainLayout />
      <ScrollRestoration />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-left" />
      {isApiLoaded && <Subscriptions />}
      <ProviderRpcSelect />
    </>
  )
}
