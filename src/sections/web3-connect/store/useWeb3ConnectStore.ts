import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { omit } from "utils/rx"
import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  SUBSTRATE_PROVIDERS,
} from "sections/web3-connect/constants/providers"

export enum WalletProviderStatus {
  Connected = "connected",
  Pending = "pending",
  Disconnected = "disconnected",
  Error = "error",
}

export enum WalletMode {
  Default = "default",
  EVM = "evm",
  Substrate = "substrate",
  SubstrateEVM = "substrate-evm",
  SubstrateH160 = "substrate-h160",
  Solana = "solana",
}

export const COMPATIBLE_WALLET_PROVIDERS: WalletProviderType[] = [
  ...SUBSTRATE_PROVIDERS,
  ...EVM_PROVIDERS,
]

export const PROVIDERS_BY_WALLET_MODE: Record<
  WalletMode,
  WalletProviderType[]
> = {
  [WalletMode.Default]: COMPATIBLE_WALLET_PROVIDERS,
  [WalletMode.EVM]: EVM_PROVIDERS,
  [WalletMode.Substrate]: SUBSTRATE_PROVIDERS,
  [WalletMode.SubstrateEVM]: [...SUBSTRATE_PROVIDERS, ...EVM_PROVIDERS],
  [WalletMode.SubstrateH160]: SUBSTRATE_H160_PROVIDERS,
  [WalletMode.Solana]: SOLANA_PROVIDERS,
}

export type Account = {
  name: string
  address: string
  displayAddress?: string
  genesisHash?: `0x${string}`
  provider: WalletProviderType
  isExternalWalletConnected?: boolean
  delegate?: string
}
type WalletProviderMeta = {
  chain?: string
  title?: string
  description?: string
}
type WalletProviderEntry = {
  type: WalletProviderType
  status: WalletProviderStatus
}
export type WalletProviderState = {
  open: boolean
  providers: WalletProviderEntry[]
  recentProvider: WalletProviderType | null
  account: Account | null
  mode: WalletMode
  error?: string
  meta?: WalletProviderMeta | null
}

type WalletProviderStore = WalletProviderState & {
  toggle: (mode?: WalletMode, meta?: WalletProviderMeta) => void
  setAccount: (account: Account | null) => void
  setStatus: (
    provider: WalletProviderType | null,
    status: WalletProviderStatus,
  ) => void
  getStatus: (provider: WalletProviderType | null) => WalletProviderStatus
  getConnectedProviders: () => WalletProviderEntry[]
  setError: (error: string) => void
  disconnectIncompatible: () => void
  disconnect: (provider?: WalletProviderType) => void
}

const initialState: WalletProviderState = {
  open: false,
  providers: [],
  recentProvider: null,
  account: null,
  mode: WalletMode.Default,
  error: "",
  meta: null,
}

export const useWeb3ConnectStore = create<WalletProviderStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      toggle: (mode, meta) =>
        set((state) => {
          const isValidMode = mode && Object.values(WalletMode).includes(mode)
          return {
            ...state,
            mode: isValidMode ? mode : getDefaultWalletMode(),
            open: !state.open,
            meta: meta ?? null,
          }
        }),
      setAccount: (account) => set((state) => ({ ...state, account })),
      setStatus: (provider, status) => {
        const isError = status === WalletProviderStatus.Error
        return set((state) => ({
          ...state,
          providers: provider
            ? [
                ...state.providers.filter((p) => p.type !== provider),
                { type: provider, status },
              ]
            : state.providers,
          recentProvider: provider,
          account: isError ? null : state.account,
          error: isError ? state.error : "",
        }))
      },
      getStatus: (provider) => {
        const foundProvider = get().providers.find((p) => p.type === provider)
        return foundProvider?.status ?? WalletProviderStatus.Disconnected
      },
      getConnectedProviders: () => {
        const { mode, providers } = get()

        if (mode === WalletMode.Default) {
          return providers
        }

        return providers.filter(({ type }) => {
          const providers = PROVIDERS_BY_WALLET_MODE[mode]

          if (providers.length > 0) {
            return providers.includes(type)
          }

          return true
        })
      },
      setError: (error) => set((state) => ({ ...state, error })),
      disconnectIncompatible: () =>
        set((state) => ({
          ...state,
          ...initialState,
          account:
            state.account &&
            COMPATIBLE_WALLET_PROVIDERS.includes(state.account.provider)
              ? state.account
              : null,
          providers: state.providers.filter((p) =>
            COMPATIBLE_WALLET_PROVIDERS.includes(p.type),
          ),
          mode: state.mode,
          open: state.open,
        })),
      disconnect: (provider) => {
        set((state) => ({
          ...state,
          ...initialState,
          account:
            !provider || provider === state.account?.provider
              ? null
              : state.account,
          providers: provider
            ? state.providers.filter((p) => p.type !== provider)
            : [],
          recentProvider: null,
          mode: state.mode,
          open: state.open,
        }))
      },
    }),
    {
      name: "web3-connect",
      partialize: (state) => omit(["open"], state),
      version: 5,
    },
  ),
)

const getDefaultWalletMode = () => {
  const params = new URLSearchParams(window.location.search)
  if (params.get("srcChain") === "solana") {
    return WalletMode.Solana
  }

  if (params.get("srcChain") === "mythos") {
    return WalletMode.SubstrateH160
  }

  if (params.get("srcChain") === "ethereum") {
    return WalletMode.EVM
  }

  return WalletMode.Default
}
