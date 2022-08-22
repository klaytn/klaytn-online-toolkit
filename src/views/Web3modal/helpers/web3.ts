import { Contract } from 'web3-eth-contract'
import { WEB3MODAL } from 'consts'
import { apiGetGasPriceKlaytn, getChainData } from './utilities'

export function getKIP7Contract(web3: any, contractAddress: string): Contract {
  const tokenContract = new web3.eth.Contract(
    WEB3MODAL.KIP7_CONTRACT.abi,
    contractAddress
  )
  return tokenContract
}

export function getKIP17Contract(web3: any, contractAddress: string): Contract {
  const tokenContract = new web3.eth.Contract(
    WEB3MODAL.KIP17_CONTRACT.abi,
    contractAddress
  )
  return tokenContract
}

export function callBalanceOf(
  address: string,
  chainId: number,
  contractAddress: string,
  web3: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const contract = getKIP7Contract(web3, contractAddress)

      await contract.methods
        .balanceOf(address)
        .call(
          { from: '0x0000000000000000000000000000000000000000' },
          (err: any, data: any) => {
            if (err) {
              reject(err)
            }
            resolve(data)
          }
        )
    } catch (err) {
      reject(err)
    }
  })
}

export function callTransfer(
  address: string,
  chainId: number,
  contractAddress: string,
  web3: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const contract = getKIP7Contract(web3, contractAddress)
      const chain = getChainData(chainId).chain
      const gasPrice =
        chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined
      const gas =
        chain === 'klaytn'
          ? await contract.methods
              .transfer(address, '1')
              .estimateGas({ from: address })
          : undefined
      await contract.methods
        .transfer(address, '1')
        .send(
          { from: address, gas: gas, gasPrice: gasPrice },
          (err: any, data: any) => {
            if (err) {
              reject(err)
            }
            resolve(data)
          }
        )
    } catch (err) {
      reject(err)
    }
  })
}

export function callTransferFrom(
  address: string,
  chainId: number,
  contractAddress: string,
  web3: any,
  toAddress: string,
  tokenId: number
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const contract = getKIP17Contract(web3, contractAddress)
      const chain = getChainData(chainId).chain
      const gasPrice =
        chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined
      const gas =
        chain === 'klaytn'
          ? await contract.methods
              .transferFrom(address, toAddress, tokenId)
              .estimateGas({ from: address })
          : undefined
      await contract.methods
        .transferFrom(address, toAddress, tokenId)
        .send(
          { from: address, gas: gas, gasPrice: gasPrice },
          (err: any, data: any) => {
            if (err) {
              reject(err)
            }
            resolve(data)
          }
        )
    } catch (err) {
      reject(err)
    }
  })
}

export function callDeployNFT(
  address: string,
  chainId: number,
  web3: any,
  name: string,
  symbol: string
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const contract = new web3.eth.Contract(WEB3MODAL.KIP17_CONTRACT.abi)
      const chain = getChainData(chainId).chain
      const gasPrice =
        chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined
      await contract
        .deploy({
          data: WEB3MODAL.KIP17_CONTRACT.bytecode,
          arguments: [name, symbol],
        })
        .send(
          {
            from: address,
            gas: 10000000,
            gasPrice: gasPrice,
          },
          (err: any, data: any) => {
            if (err) {
              reject(err)
            }
            resolve(data)
          }
        )
    } catch (err) {
      reject(err)
    }
  })
}

export function callMintNFT(
  address: string,
  chainId: number,
  contractAddress: string,
  web3: any,
  toAddress: string,
  tokenId: number,
  tokenURI: string
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const contract = getKIP17Contract(web3, contractAddress)
      const chain = getChainData(chainId).chain
      const gasPrice =
        chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined
      await contract.methods
        .mintWithTokenURI(toAddress, tokenId, tokenURI)
        .send(
          {
            from: address,
            gas: 10000000,
            gasPrice: gasPrice,
          },
          (err: any, data: any) => {
            if (err) {
              reject(err)
            }
            resolve(data)
          }
        )
    } catch (err) {
      reject(err)
    }
  })
}
