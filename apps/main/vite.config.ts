import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"
import wasm from "vite-plugin-wasm"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  build: {
    outDir: "build",
    rollupOptions: {
      external: ["viem"],
    },
  },
  plugins: [
    react({
      jsxImportSource: "@galacticcouncil/ui/jsx",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    wasm(),
    svgr({
      svgrOptions: {
        svgo: true,
      },
    }),
    tsconfigPaths(),
    TanStackRouterVite(),
  ],
})
