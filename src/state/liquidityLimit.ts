import { create } from "zustand"
import { persist } from "zustand/middleware"

type LimitStore = {
  addLiquidityLimit: string
  udpate: (value: string) => void
}

export const useLiquidityLimit = create<LimitStore>()(
  persist(
    (set) => ({
      addLiquidityLimit: "1",
      udpate: (value) => set(() => ({ addLiquidityLimit: value })),
    }),
    {
      name: "liquidity-limit",
    },
  ),
)
