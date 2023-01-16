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

type FeeDelegationType = {
  feeDelegationProps: {
    walletAddress: string
    signedTx: string
  }
}

const FeeDelegation = ({
  feeDelegationProps,
}: FeeDelegationType): ReactElement => {
  const { walletAddress, signedTx } = feeDelegationProps

  const [txHash, setTxHash] = useState('')
  const [receipt, setReceipt] = useState<ResultFormType<TransactionReceipt>>()
  const [error, setError] = useState<ResultFormType>()

  const sendTransaction = (): void => {
    try {
      caver.klay
        .sendTransaction({
          senderRawTransaction: signedTx,
          feePayer: walletAddress,
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
        <h4>Fee Payer</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>Fee Payer Address</Label>
            <FormInput
              type="text"
              placeholder="Address you logged in kaikas"
              onChange={(): void => {}}
              value={walletAddress}
            />
          </View>
          <Button onClick={sendTransaction}>Send Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

caver.klay
  .sendTransaction({
    senderRawTransaction: signedTx,
    feePayer: walletAddress,
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

export default FeeDelegation
