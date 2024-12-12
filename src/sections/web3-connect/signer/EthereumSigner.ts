import {
  JsonRpcSigner,
  TransactionRequest,
  Web3Provider,
} from "@ethersproject/providers"
import UniversalProvider from "@walletconnect/universal-provider/dist/types/UniversalProvider"

import { chainsMap } from "@galacticcouncil/xcm-cfg"
import BigNumber from "bignumber.js"
import { Contract, Signature } from "ethers"
import { splitSignature } from "ethers/lib/utils"
import {
  CALL_PERMIT_ABI,
  CALL_PERMIT_ADDRESS,
  DISPATCH_ADDRESS,
} from "utils/evm"
import {
  MetaMaskLikeProvider,
  isEthereumProvider,
  requestNetworkSwitch,
} from "utils/metamask"

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

    const onePrc = gasPrice.div(100)
    const gasPricePlus = gasPrice.add(onePrc)

    return {
      gas,
      gasPrice,
      maxPriorityFeePerGas: gasPricePlus,
      maxFeePerGas: gasPricePlus,
    }
  }

  requestNetworkSwitch = async (chain: string, onSwitch?: () => void) => {
    if (isEthereumProvider(this.provider)) {
      await requestNetworkSwitch(this.provider, {
        chain,
        onSwitch: () => {
          // update signer after network switch
          this.signer = this.getSigner(this.provider)

          onSwitch?.()
        },
      })
    }
  }

  sendDispatch = async (
    data: string,
    chain?: string,
    options?: { onNetworkSwitch?: () => void },
  ) => {
    return this.sendTransaction(
      {
        to: DISPATCH_ADDRESS,
        data,
        from: this.address,
        chain,
      },
      { onNetworkSwitch: options?.onNetworkSwitch },
    )
  }

  getPermitNonce = async (): Promise<BigNumber> => {
    await this.requestNetworkSwitch("hydration")
    const callPermit = new Contract(
      CALL_PERMIT_ADDRESS,
      CALL_PERMIT_ABI,
      this.signer.provider,
    )

    const nonce = await callPermit.nonces(this.address)

    return BigNumber(nonce.toString())
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
    options?: { onNetworkSwitch?: () => void },
  ) => {
    const { chain, ...tx } = transaction
    const from = chain && chainsMap.get(chain) ? chain : "hydration"

    await this.requestNetworkSwitch(from, () => {
      options?.onNetworkSwitch?.()
    })

    if (from === "hydration") {
      const { gas, maxFeePerGas, maxPriorityFeePerGas } =
        await this.getGasValues(tx)

      return await this.signer.sendTransaction({
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit: gas.mul(12).div(10), // add 20%
        ...tx,
      })
    } else {
      return await this.signer.sendTransaction({
        ...tx,
      })
    }
  }
}
