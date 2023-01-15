import { ReactElement, useState } from 'react'
import Caver, { TransactionReceipt } from 'caver-js'
import _ from 'lodash'

import { ResultFormType } from 'types'
import {
  Label,
  FormInput,
  Button,
  CardSection,
  ResultForm,
  CodeBlock,
  View,
} from 'components'

const caver = new Caver(window.klaytn)

type WalletInfoType = {
  walletProps: {
    walletAddress: string
  }
}

const AccountUpdate = ({ walletProps }: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps

  const [gas, setGas] = useState('3000000')

  const [walletKey, setWalletKey] = useState('')
  const [publicKey, setPublicKey] = useState('')

  const [txHash, setTxHash] = useState('')
  const [receipt, setReceipt] = useState<ResultFormType<TransactionReceipt>>()
  const [error, setError] = useState<ResultFormType>()

  const signAndSendTransaction = (): void => {
    try {
      const tx = {
        type: 'ACCOUNT_UPDATE',
        from: walletAddress,
        gas: gas,
        publicKey: publicKey,
      }

      caver.klay
        .sendTransaction(tx)
        .once('transactionHash', (transactionHash) => {
          setError(undefined)
          setReceipt(undefined)
          setTxHash(transactionHash)
        })
        .once('receipt', (receipt) => {
          setReceipt({ success: true, value: receipt })
        })
        .once('error', (err) => {
          setError({
            success: false,
            message: err.message,
          })
        })
    } catch (err) {
      setError({
        success: false,
        message: _.toString(err),
      })
    }
  }

  const generateKeyPair = (): void => {
    const { privateKey } = caver.klay.accounts.create()
    const newPublicKey = caver.klay.accounts.privateKeyToPublicKey(privateKey)
    const newWalletKey = `${privateKey}0x00${walletAddress}`
    setPublicKey(newPublicKey)
    setWalletKey(newWalletKey)
  }

  return (
    <>
      <CardSection>
        <h4>Generate New Keypair</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>New Wallet Key</Label>
            <FormInput
              type="text"
              placeholder="Generate new wallet key for account update"
              onChange={setWalletKey}
              value={walletKey}
            />
          </View>
          <Button onClick={generateKeyPair}>
            Generate New Wallet Key and Public Key
          </Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const { privateKey } = caver.klay.accounts.create()
const newPublicKey = caver.klay.accounts.privateKeyToPublicKey(privateKey)
const newWalletKey = \`\${privateKey}0x00\${walletAddress}\`
setPublicKey(newPublicKey)
setWalletKey(newWalletKey)`}
          />
        </View>
      </CardSection>
      <CardSection>
        <h4>Account Update</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>From</Label>
            <FormInput
              type="text"
              placeholder="Address you want to update"
              onChange={(): void => {}}
              value={walletAddress}
            />
            <Label>New Public Key</Label>
            <FormInput
              type="text"
              placeholder="New Public Key"
              onChange={setPublicKey}
              value={publicKey}
            />
            <Label>Gas</Label>
            <FormInput
              type="text"
              placeholder="Gas (Peb)"
              onChange={setGas}
              value={gas}
            />
          </View>
          <Button onClick={signAndSendTransaction}>
            Sign & Send Transaction
          </Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const tx = {
  type: 'ACCOUNT_UPDATE',
  from: walletAddress,
  gas: gas,
  publicKey: publicKey,
}

caver.klay
  .sendTransaction(tx)
  .once('transactionHash', (transactionHash) => {
    setTxHash(transactionHash)
  })
  .once('receipt', (receipt) => {
    setReceipt({ success: true, value: receipt })
  })
  .once('error', (err) => {
    setError({ success: false, message: err.message })
  })
} catch (err) {
setError({ success: false, message: _.toString(err) })
}
`}
          />
        </View>
      </CardSection>
      {!error && txHash && (
        <CardSection>
          <h4>Transaction Result</h4>
          {txHash && (
            <ResultForm
              title={'TxHash'}
              result={{ success: true, value: txHash }}
            />
          )}
          {receipt && <ResultForm title={'Receipt'} result={receipt} />}
        </CardSection>
      )}
      {error && <ResultForm title={'Error'} result={error} />}
    </>
  )
}

export default AccountUpdate
