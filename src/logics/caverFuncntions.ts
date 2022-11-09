import Caver from 'caver-js'

const caver = new Caver()

export const generateSingleKey = caver.wallet.keyring.generateSingleKey

export const createFromPrivateKey = caver.wallet.keyring.createFromPrivateKey

export const keyringDecrypt = caver.wallet.keyring.decrypt
