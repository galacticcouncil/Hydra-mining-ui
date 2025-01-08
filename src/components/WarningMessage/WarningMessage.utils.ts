import { LINKS } from "utils/navigation"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type TWarningStore = {
  warnings: {
    hdxLiquidity: { visible?: boolean; visibility: (keyof typeof LINKS)[] }
    wbtcCollateral: { visible?: boolean; visibility: (keyof typeof LINKS)[] }
  }
  setWarnings: (key: TWarningsType, isOpen: boolean) => void
}

export type TWarningsType = keyof TWarningStore["warnings"]

export const useWarningsStore = create(
  persist<TWarningStore>(
    (set) => ({
      warnings: {
        hdxLiquidity: {
          visible: undefined,
          visibility: [
            "allPools",
            "omnipool",
            "myLiquidity",
            "isolated",
            "walletAssets",
            "walletVesting",
          ],
        },
        wbtcCollateral: {
          visible: true,
          visibility: [],
        },
      },
      setWarnings: (key, isOpen) =>
        set(({ warnings }) => ({
          warnings: {
            ...warnings,
            [key]: { ...warnings[key], visible: isOpen },
          },
        })),
    }),
    {
      name: "warnings",
      version: 0.4,
      getStorage: () => window.sessionStorage,
    },
  ),
)
