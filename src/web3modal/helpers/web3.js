import { KIP7_CONTRACT } from '../constants'
import { apiGetGasPriceKlaytn, apiGetGasPrices, getChainData } from './utilities'

export function getKIP7Contract(web3, contractAddress) {
    const tokenContract = new web3.eth.Contract(
        KIP7_CONTRACT.abi,
        contractAddress
    );
    return tokenContract;
}

export function callBalanceOf(address, chainId, contractAddress, web3) {
    return new Promise(async(resolve, reject) => {
        try{
            const contract = getKIP7Contract(web3, contractAddress)

            await contract.methods
            .balanceOf(address)
            .call(
                { from: '0x0000000000000000000000000000000000000000' },
                (err, data) => {
                if (err) {
                    console.log('err', err)
                    reject(err)
                }
                    resolve(data)
                }
            )
        } catch(err) {
            reject(err)
        }
    })
}

export function callTransfer(address, chainId, contractAddress, web3) {
    return new Promise(async(resolve, reject) => {
        try {
            const contract = getKIP7Contract(web3, contractAddress)
            const chain = getChainData(chainId).chain
            const gasPrice = chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined;
            const gas = chain === 'klaytn'
                ? await contract.methods.transfer(address, '1').estimateGas({from: address})
                : undefined;
            await contract.methods
            .transfer(address, '1')
            .send({ from: address, gas: gas, gasPrice: gasPrice}, (err, data) => {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        } catch(err) {
            reject(err)
        }
    })
}
