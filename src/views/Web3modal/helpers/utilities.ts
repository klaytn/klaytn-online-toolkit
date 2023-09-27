import supportedChains from './chains'
import * as ethUtil from 'ethereumjs-util'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { IAssetData, IChainData, IGasPrices } from 'types'

const api = axios.create({
  baseURL: 'https://ethereum-api.xyz',
  timeout: 30000, // 30 secs
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export function isObject(obj: any): boolean {
  return typeof obj === 'object' && !!Object.keys(obj).length
}

export async function apiGetGasPriceKlaytn(chainId: number): Promise<string> {
  const url =
    chainId === 8217
      ? 'https://klaytn-mainnet-rpc.allthatnode.com:8551'
      : 'https://klaytn-baobab-rpc.allthatnode.com:8551'
  const response = await axios.post(url, {
    jsonrpc: '2.0',
    id: 0,
    method: 'klay_gasPrice',
  })
  const { result } = response.data
  return result
}

export const apiGetAccountNonce = async (
  address: string,
  chainId: number
): Promise<string> => {
  const response = await api.get(
    `/account-nonce?address=${address}&chainId=${chainId}`
  )
  const { result } = response.data
  return result
}

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`)
  const { result } = response.data
  return result
}

export async function apiGetAccountAssets(
  address: string,
  chainId: number
): Promise<IAssetData[]> {
  if (getChainData(chainId).chain === 'klaytn') {
    return await apiGetAccountAssetsKlaytn(address, chainId)
  }
  const response = await api.get(
    `/account-assets?address=${address}&chainId=${chainId}`
  )
  const { result } = response.data
  return result
}

export async function apiGetAccountAssetsKlaytn(
  address: string,
  chainId: number
): Promise<IAssetData[]> {
  const url =
    chainId === 8217
      ? 'https://klaytn-mainnet-rpc.allthatnode.com:8551'
      : 'https://klaytn-baobab-rpc.allthatnode.com:8551'
  const response = await axios.post(url, {
    jsonrpc: '2.0',
    id: 0,
    method: 'klay_getBalance',
    params: [address, 'latest'],
  })

  const result = {
    symbol: 'KLAY',
    name: 'Klaytn',
    decimals: '18',
    contractAddress: '',
    balance: response.data.result,
  }
  return [result]
}

export function sanitizeHex(hex: string): string {
  hex = hex.substring(0, 2) === '0x' ? hex.substring(2) : hex
  if (hex === '') {
    return ''
  }
  hex = hex.length % 2 !== 0 ? '0' + hex : hex
  return '0x' + hex
}

export function convertStringToHex(value: string): string {
  return new BigNumber(`${value}`).toString(16)
}

export function convertAmountToRawNumber(
  value: string | number,
  decimals = 18
): string {
  return new BigNumber(`${value}`)
    .times(new BigNumber('10').pow(decimals))
    .toString()
}

export function getChainData(chainId: number): IChainData {
  const chainData = supportedChains.filter(
    (chain) => chain.chain_id === chainId
  )[0]

  if (!chainData) {
    throw new Error('ChainId missing or not supported')
  }

  const API_KEY = process.env.REACT_APP_INFURA_ID

  if (
    chainData.rpc_url.includes('infura.io') &&
    chainData.rpc_url.includes('%API_KEY%') &&
    API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace('%API_KEY%', API_KEY)

    return {
      ...chainData,
      rpc_url: rpcUrl,
    }
  }

  return chainData
}

export function hashPersonalMessage(msg: string): string {
  const buffer = Buffer.from(msg)
  const result = ethUtil.hashPersonalMessage(buffer)
  const hash = ethUtil.bufferToHex(result)
  return hash
}

export function recoverPublicKey(sig: string, hash: string): string {
  const sigParams = ethUtil.fromRpcSig(sig)
  const hashBuffer = Buffer.from(hash.replace('0x', ''), 'hex')
  const result = ethUtil.ecrecover(
    hashBuffer,
    sigParams.v,
    sigParams.r,
    sigParams.s
  )
  const signer = ethUtil.bufferToHex(ethUtil.publicToAddress(result))
  return signer
}

export async function formatTestTransaction(
  address: string,
  chainId: number
): Promise<any> {
  if (getChainData(chainId).chain === 'klaytn') {
    const gasPrice = await apiGetGasPriceKlaytn(chainId)
    return {
      from: address,
      to: address,
      gas: '21000',
      value: new BigNumber(10 ** 18 * 0.000001).toString(),
      gasPrice,
    }
  }

  // from
  const from = address

  // to
  const to = address

  // nonce
  const _nonce = await apiGetAccountNonce(address, chainId)
  const nonce = sanitizeHex(convertStringToHex(_nonce))

  // gasPrice
  const gasPrices = await apiGetGasPrices()
  const _gasPrice = gasPrices.slow.price
  const gasPrice = sanitizeHex(
    convertStringToHex(convertAmountToRawNumber(_gasPrice, 9))
  )

  // gasLimit
  const _gasLimit = '21000'
  const gasLimit = sanitizeHex(convertStringToHex(_gasLimit))

  // value
  const _value = '0'
  const value = sanitizeHex(convertStringToHex(_value))

  // data
  const data = '0x'

  // test transaction
  const tx = {
    from,
    to,
    nonce,
    gasPrice,
    gasLimit,
    value,
    data,
  }

  return tx
}
