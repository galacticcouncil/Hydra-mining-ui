import {
  JsonRpcSigner,
  TransactionRequest,
  Web3Provider,
} from "@ethersproject/providers"
import UniversalProvider from "@walletconnect/universal-provider/dist/types/UniversalProvider"

import { chainsMap } from "@galacticcouncil/xcm-cfg"
import BigNumber from "bignumber.js"
import { Signature } from "ethers"
import { splitSignature } from "ethers/lib/utils"
import { CALL_PERMIT_ADDRESS, DISPATCH_ADDRESS } from "utils/evm"
import {
  MetaMaskLikeProvider,
  isEthereumProvider,
  requestNetworkSwitch,
} from "utils/metamask"
import { sleep } from "utils/helpers"
import { EvmChain } from "@galacticcouncil/xcm-core"

type PermitMessage = {
  from: string
  to: string
  value: number
  data: string
  gaslimit: number
  nonce: number
  deadline: number
}

export type PermitResult = { signature: Signature; message: PermitMessage }

type EthereumProvider = MetaMaskLikeProvider | UniversalProvider

export class EthereumSigner {
  address: string
  provider: EthereumProvider
  signer: JsonRpcSigner

  constructor(address: string, provider: EthereumProvider) {
    this.address = address
    this.provider = provider
    this.signer = this.getSigner(provider)
  }

  getSigner(provider: EthereumProvider) {
    return new Web3Provider(provider).getSigner()
  }

  setAddress(address: string) {
    this.address = address
  }

  async getGasValues(tx: TransactionRequest) {
    const [gas, gasPrice] = await Promise.all([
      this.signer.provider.estimateGas(tx),
      this.signer.provider.getGasPrice(),
    ])

    const fivePrc = gasPrice.div(100).mul(5)
    const gasPricePlus = gasPrice.add(fivePrc)

    return {
      gas,
      gasPrice,
      maxPriorityFeePerGas: gasPricePlus,
      maxFeePerGas: gasPricePlus,
    }
  }

  requestNetworkSwitch = async (chain: string) => {
    if (isEthereumProvider(this.provider)) {
      await requestNetworkSwitch(this.provider, {
        chain,
      })
      // update signer after network switch
      // give some leeway for the network switch to take effect,
      // some wallets like Coinbase dont reflect the change inside provider immediately
      await sleep(200)
      this.signer = this.getSigner(this.provider)
    }
  }

  sendDispatch = async (data: string, chain?: string) => {
    return this.sendTransaction({
      to: DISPATCH_ADDRESS,
      data,
      from: this.address,
      chain,
    })
  }

  getPermit = async (
    data: string | TransactionRequest,
    nonce: BigNumber,
  ): Promise<PermitResult> => {
    if (this.provider && this.address) {
      await this.requestNetworkSwitch("hydration")
      const tx =
        typeof data === "string"
          ? {
              from: this.address,
              to: DISPATCH_ADDRESS,
              data,
            }
          : {
              from: data?.from ?? "",
              to: data?.to ?? "",
              data: data.data?.toString() ?? "",
              gasLimit: data.gasLimit?.toString() ?? "0",
            }

      if (!tx.from)
        throw new Error("Permit transaction must have a 'from' field")
      if (!tx.to) throw new Error("Permit transaction must have a 'to' field")
      if (!tx.data)
        throw new Error("Permit transaction must have a 'data' field")

      let gasLimit = BigNumber(0)
      if (tx.gasLimit) {
        gasLimit = BigNumber(tx.gasLimit.toString())
      } else {
        const { gas } = await this.getGasValues(tx)
        gasLimit = BigNumber(gas.toString())
      }

      const createPermitMessageData = () => {
        const message: PermitMessage = {
          ...tx,
          value: 0,
          gaslimit: gasLimit
            .multipliedBy(1.2) // add 20%
            .decimalPlaces(0)
            .toNumber(),
          nonce: nonce.toNumber(),
          deadline: Math.floor(Date.now() / 1000 + 3600),
        }

        const typedData = JSON.stringify({
          types: {
            EIP712Domain: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "version",
                type: "string",
              },
              {
                name: "chainId",
                type: "uint256",
              },
              {
                name: "verifyingContract",
                type: "address",
              },
            ],
            CallPermit: [
              {
                name: "from",
                type: "address",
              },
              {
                name: "to",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "data",
                type: "bytes",
              },
              {
                name: "gaslimit",
                type: "uint64",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          primaryType: "CallPermit",
          domain: {
            name: "Call Permit Precompile",
            version: "1",
            chainId: parseInt(import.meta.env.VITE_EVM_CHAIN_ID),
            verifyingContract: CALL_PERMIT_ADDRESS,
          },
          message: message,
        })

        return {
          typedData,
          message,
        }
      }

      const { message, typedData } = createPermitMessageData()

      const method = "eth_signTypedData_v4"
      const params = [this.address, typedData]

      return new Promise((resolve, reject) => {
        if (typeof this.provider.request !== "function") {
          return reject(new Error("Provider does not support request method"))
        }

        return this.provider
          .request({
            method,
            params,
          })
          .then((result) =>
            resolve({
              message,
              signature: splitSignature(result),
            }),
          )
          .catch(reject)
      })
    }

    throw new Error("Error signing transaction. Provider not found")
  }

  sendTransaction = async (
    transaction: TransactionRequest & { chain?: string },
  ) => {
    const { chain, ...tx } = transaction
    const from = chain && chainsMap.get(chain)?.isEvmChain ? chain : "hydration"
    const chainCfg = chainsMap.get(from) as EvmChain

    await this.requestNetworkSwitch(from)

    if (from === "hydration") {
      const { gas, maxFeePerGas, maxPriorityFeePerGas } =
        await this.getGasValues(tx)

      const chainId = chainCfg.evmChain.id
      const nonce = await this.signer.getTransactionCount()

      return await this.signer.sendTransaction({
        chainId,
        nonce,
        value: 0,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit: gas.mul(13).div(10), // add 30%
        ...tx,
      })
    } else {
      return await this.signer.sendTransaction({
        ...tx,
      })
    }
  }
}
