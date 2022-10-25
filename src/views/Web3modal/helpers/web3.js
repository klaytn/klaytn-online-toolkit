import { KIP7_CONTRACT, KIP17_CONTRACT } from '../constants'
import { apiGetGasPriceKlaytn,  getChainData } from './utilities'

export function getKIP7Contract(web3, contractAddress) {
    const tokenContract = new web3.eth.Contract(
        KIP7_CONTRACT.abi,
        contractAddress
    );
    return tokenContract;
}

export function getKIP17Contract(web3, contractAddress) {
    const tokenContract = new web3.eth.Contract(
        KIP17_CONTRACT.abi,
        contractAddress
    );
    return tokenContract
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

export function callTransferFrom(address, chainId, contractAddress, web3, toAddress, tokenId) {
    return new Promise(async(resolve, reject) => {
        try {
            const contract = getKIP17Contract(web3, contractAddress)
            const chain = getChainData(chainId).chain
            const gasPrice = chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined;
            const gas = chain === 'klaytn'
                ? await contract.methods.transferFrom(address, toAddress, tokenId).estimateGas({from: address})
                : undefined;
            await contract.methods
            .transferFrom(address, toAddress, tokenId)
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

export function callDeployNFT(address, chainId, web3, name, symbol){
    return new Promise(async(resolve, reject) => {
        try {
            const contract = new web3.eth.Contract(KIP17_CONTRACT.abi)
            const chain = getChainData(chainId).chain
            const gasPrice = chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined;
            await contract.deploy({data: KIP17_CONTRACT.bytecode, arguments: [name, symbol]})
            .send({
                from: address,
                gas: 10000000,
                gasPrice: gasPrice
            }, (err, data)=>{
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

export function callMintNFT(address, chainId, contractAddress, web3, toAddress, tokenId, tokenURI){
    return new Promise(async(resolve, reject) => {
        try {
            const contract = getKIP17Contract(web3, contractAddress)
            const chain = getChainData(chainId).chain
            const gasPrice = chain === 'klaytn' ? await apiGetGasPriceKlaytn(chainId) : undefined;
            await contract.methods
            .mintWithTokenURI(toAddress, tokenId, tokenURI)
            .send({
                from: address,
                gas: 200000,
                gasPrice: gasPrice
            }, (err, data)=>{
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