import { create } from "zustand"
import { persist } from "zustand/middleware"

type UnifiedAddressesBannerStore = {
  visible: boolean
  hide: () => void
}

export const useUnifiedAddressesBannerStore =
  create<UnifiedAddressesBannerStore>()(
    persist(
      (set) => ({
        visible: true,
        hide: () => set({ visible: false }),
      }),
      {
        name: "unified-addresses-banner",
        version: 0,
      },
    ),
  )
