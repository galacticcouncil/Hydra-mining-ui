import { ethers } from "ethers"
import { SDKProvider } from "@metamask/sdk/dist/browser/es/src/provider/SDKProvider"
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto"
import { Buffer } from "buffer"
import { HYDRA_ADDRESS_PREFIX } from "./api"

export async function connectMetamask(provider: SDKProvider) {
  const [address] = await provider.request({
    method: "eth_requestAccounts",
    params: [],
  })
  return new H160(address)
}

const DISPATCH_ADDRESS = "0x0000000000000000000000000000000000000401"

export async function sendDispatch(from: string, extrinsic) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const data = extrinsic.method.toHex()
  const tx = { to: DISPATCH_ADDRESS, data, from }
  const [gas, gasPrice] = await Promise.all([
    provider.estimateGas(tx),
    provider.getGasPrice(),
  ])
  return signer.sendTransaction({
    ...tx,
    maxPriorityFeePerGas: gasPrice,
    maxFeePerGas: gasPrice,
    gasLimit: gas.mul(2),
  })
}

export function isEvmAccount(address: string) {
  const { prefixBytes } = H160
  const pub = decodeAddress(address, true)
  return Buffer.from(pub.subarray(0, prefixBytes.length)).equals(prefixBytes)
}

export class H160 {
  static prefixBytes = Buffer.from("ETH\0")
  address: string

  constructor(address: string) {
    this.address = address
  }

  toAccount = () => {
    const addressBytes = Buffer.from(this.address.slice(2), "hex")
    return encodeAddress(
      new Uint8Array(
        Buffer.concat([H160.prefixBytes, addressBytes, Buffer.alloc(8)]),
      ),
      HYDRA_ADDRESS_PREFIX,
    )
  }
}
