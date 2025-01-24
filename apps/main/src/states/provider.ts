import { create } from "zustand"
import { persist } from "zustand/middleware"

import { TDataEnv } from "@/api/provider"
import { PROVIDERS } from "@/config/rpc"

type RpcListStore = {
  rpcList: Array<{
    name?: string
    url: string
  }>
  addRpc: (account: string) => void
  removeRpc: (url: string) => void
  renameRpc: (url: string, newName: string) => void
}

export const useRpcListStore = create<RpcListStore>()(
  persist(
    (set) => ({
      rpcList: [],
      addRpc: (url) =>
        set((store) => ({ rpcList: [...store.rpcList, { url }] })),
      removeRpc: (urlToRemove) =>
        set((store) => ({
          rpcList: store.rpcList.filter((rpc) => rpc.url !== urlToRemove),
        })),
      renameRpc: (urlToRename, name) =>
        set((store) => ({
          rpcList: store.rpcList.map((rpc) =>
            rpc.url === urlToRename ? { ...rpc, name } : rpc,
          ),
        })),
    }),
    {
      name: "rpcList",
    },
  ),
)

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl: string
    autoMode: boolean
    setRpcUrl: (rpcUrl: string | undefined) => void
    getDataEnv: () => TDataEnv
    setAutoMode: (state: boolean) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl } = get()

        return (
          PROVIDERS.find((provider) => provider.url === rpcUrl)?.dataEnv ??
          "mainnet"
        )
      },
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      version: 2.1,
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)
