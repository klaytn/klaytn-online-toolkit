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

const TokenTransferLegacy = ({ walletProps }: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps
  const [toAddress, setToAddress] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [decimal, setDecimal] = useState('18')
  const [amount, setAmount] = useState('')
  const [gas, setGas] = useState('3000000')
  const [txHash, setTxHash] = useState('')
  const [receipt, setReceipt] = useState<ResultFormType<TransactionReceipt>>()
  const [error, setError] = useState<ResultFormType>()

  const transfer = (): void => {
    if (Number(decimal) > 20) {
      return alert('Decimal should be less than 21')
    }

    const encodedData = caver.klay.abi.encodeFunctionCall(
      {
        name: 'transfer',
        type: 'function',
        inputs: [
          {
            type: 'address',
            name: 'recipient',
          },
          {
            type: 'uint256',
            name: 'amount',
          },
        ],
      },
      [
        toAddress,
        caver.utils
          .toBN(amount)
          .mul(caver.utils.toBN(Number(`1e${decimal}`)))
          .toString(),
      ]
    )

    try {
      caver.klay
        .sendTransaction({
          from: walletAddress,
          to: contractAddress,
          data: encodedData,
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
        <h4>Token Transfer (Legacy)</h4>
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
              placeholder="Address you want to send token to"
              onChange={setToAddress}
              value={toAddress}
            />
            <Label>Token Contract Address</Label>
            <FormInput
              type="text"
              placeholder="The address of the deployed token contract. Please get the contract address from 'Smart Contract Deploy (Legacy)' type transaction."
              onChange={setContractAddress}
              value={contractAddress}
            />
            <Label>Token Decimal</Label>
            <FormInput
              type="text"
              placeholder="Token Decimal"
              onChange={setDecimal}
              value={decimal}
            />
            <Label>Amount</Label>
            <FormInput
              type="text"
              placeholder="Amount of token you want to send"
              onChange={setAmount}
              value={amount}
            />
            <Label>Gas</Label>
            <FormInput
              type="text"
              placeholder="Gas (Peb) you willing to pay for contract deploy"
              onChange={setGas}
              value={gas}
            />
          </View>
          <Button onClick={transfer}>Sign Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const encodedData = caver.klay.abi.encodeFunctionCall(
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      {
        type: 'address',
        name: 'recipient',
      },
      {
        type: 'uint256',
        name: 'amount',
      },
    ],
  },
  [
    toAddress,
    caver.utils
      .toBN(amount)
      .mul(caver.utils.toBN(Number(10 ** Number(decimal))))
      .toString(),
  ]
)

caver.klay
  .sendTransaction({
    from: walletAddress,
    to: contractAddress,
    data: encodedData,
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
  })
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

export default TokenTransferLegacy
