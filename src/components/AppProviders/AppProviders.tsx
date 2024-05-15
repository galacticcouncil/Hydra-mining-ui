import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ToastProvider } from "components/Toast/ToastProvider"
import { RpcProvider } from "providers/rpcProvider"
import { FC, PropsWithChildren } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { theme } from "theme"
import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"

const AppsPersistenceProvider = createComponent({
  tagName: "gc-database-provider",
  elementClass: Apps.DatabaseProvider,
  react: React,
})

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TooltipProvider>
      <RpcProvider>
        <InvalidateOnBlock>
          <ToastProvider>
            <SkeletonTheme
              baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
              highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
              borderRadius={4}
            >
              <AppsPersistenceProvider>{children}</AppsPersistenceProvider>
            </SkeletonTheme>
          </ToastProvider>
        </InvalidateOnBlock>
      </RpcProvider>
    </TooltipProvider>
  )
}
