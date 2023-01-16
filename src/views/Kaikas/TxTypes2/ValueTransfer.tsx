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

const ValueTransfer = ({ walletProps }: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps

  const [toAddress, setToAddress] = useState('')
  const [value, setValue] = useState('')
  const [gas, setGas] = useState('3000000')

  const [txHash, setTxHash] = useState('')
  const [receipt, setReceipt] = useState<ResultFormType<TransactionReceipt>>()
  const [error, setError] = useState<ResultFormType>()

  const signAndSendTransaction = (): void => {
    try {
      caver.klay
        .sendTransaction({
          type: 'VALUE_TRANSFER',
          from: walletAddress,
          to: toAddress,
          value: caver.utils.toPeb(value, 'KLAY'),
          gas: gas,
        })
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

  return (
    <>
      <CardSection>
        <h4>Value Transfer</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>From</Label>
            <FormInput
              type="text"
              placeholder="Address you logged in kaikas"
              onChange={(): void => {}}
              value={walletAddress}
            />
            <Label>To</Label>
            <FormInput
              type="text"
              placeholder="Address you want to send KLAY"
              onChange={setToAddress}
              value={toAddress}
            />
            <Label>Value</Label>
            <FormInput
              type="text"
              placeholder="Value (KLAY)"
              onChange={setValue}
              value={value}
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

caver.klay.sendTransaction({
    type: 'VALUE_TRANSFER',
    from: walletAddress,
    to: toAddress,
    value: caver.utils.toPeb(value.toString(), 'KLAY'),
    gas: gas,
  })
  .once('transactionHash', (transactionHash) => {
    setTxHash(transactionHash)
  })
  .once('receipt', (receipt) => {
    setReceipt({ success: true, value: receipt })
  })
  .once('error', (err) => {
    setError({ success: false, message: err.message })
  })`}
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

export default ValueTransfer
