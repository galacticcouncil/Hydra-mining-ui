import { join, dirname } from "path"
import type { StorybookConfig } from "@storybook/react-vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import svgr from "vite-plugin-svgr"

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")))
}



const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(config) {
    config.build = {
      ...config.build,
      target: "esnext",
    }
    config.esbuild = {
      ...config.esbuild,
      jsxFactory: "jsx",
    }
    config.plugins = [
      react({
        jsxImportSource: "@theme-ui/core",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      svgr({
        svgrOptions: {
          svgo: true,
        },
      }),
      tsconfigPaths(),
      ...(config.plugins || []),
    ]
    return config
  },
}
export default config
