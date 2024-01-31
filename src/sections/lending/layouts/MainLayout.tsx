import { Box } from "@mui/material"
import { ReactNode } from "react"

import { AppHeader } from "./AppHeader"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <LendingPageProviders>
      <AppHeader />
      <Box
        component="main"
        sx={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        {children}
      </Box>
    </LendingPageProviders>
  )
}
