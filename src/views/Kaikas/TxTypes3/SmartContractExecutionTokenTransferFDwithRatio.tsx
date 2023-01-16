import { ReactElement, useState } from 'react'
import Caver from 'caver-js'
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

import exFunctionCall from '../Common/exFunctionCall'
import FeeDelegation from '../Common/FeeDelegation'

const caver = new Caver(window.klaytn)

type WalletInfoType = {
  walletProps: {
    walletAddress: string
  }
}

const SmartContractExecutionTokenTransferFDwithRatio = ({
  walletProps,
}: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps
  const [senderAddress, setSenderAddress] = useState('')

  const [toAddress, setToAddress] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [decimal, setDecimal] = useState('18')
  const [amount, setAmount] = useState('')
  const [ratio, setRatio] = useState('')
  const [gas, setGas] = useState('3000000')

  const [signError, setSignError] = useState<ResultFormType>()
  const [signedTx, setSignedTx] = useState('')

  const signTransaction = (): void => {
    try {
      const encodedData = caver.klay.abi.encodeFunctionCall(exFunctionCall, [
        toAddress,
        caver.utils
          .toBN(amount)
          .mul(caver.utils.toBN(Number(`1e${decimal}`)))
          .toString(),
      ])

      const tx = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
        from: walletAddress,
        to: contractAddress,
        data: encodedData,
        feeRatio: ratio,
        gas: gas,
      }

      caver.klay.signTransaction(tx, (err, res) => {
        if (err) {
          setSignError({
            success: false,
            message: _.toString(err.message),
          })
        } else {
          const { rawTransaction: senderRawTransaction } = JSON.parse(
            JSON.stringify(res)
          )
          setSignError(undefined)
          setSenderAddress(walletAddress)
          setSignedTx(senderRawTransaction)
        }
      })
    } catch (err) {
      setSignError({
        success: false,
        message: _.toString(err),
      })
    }
  }

  return (
    <>
      <CardSection>
        <h4>
          Smart Contract Execution: Token Transfer (Fee Delegation with Ratio)
        </h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>From</Label>
            <FormInput
              type="text"
              placeholder="Address you logged in kaikas"
              onChange={(): void => {}}
              value={senderAddress || walletAddress}
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
              placeholder="The address of the deployed token contract. You could get the contract address from 'Smart Contract Deploy' type transaction."
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
            <Label>Ratio</Label>
            <FormInput
              type="text"
              placeholder="Fee Ratio (%)"
              onChange={setRatio}
              value={ratio}
            />
            <Label>Gas</Label>
            <FormInput
              type="text"
              placeholder="Gas (Peb) you willing to pay for contract deploy"
              onChange={setGas}
              value={gas}
            />
          </View>
          <Button onClick={signTransaction}>Sign Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const encodedData = caver.klay
  .abi.encodeFunctionCall(exFunctionCall, [
    toAddress,
    caver.utils
      .toBN(amount)
      .mul(caver.utils.toBN(Number(\`1e\${decimal}\`)))
      .toString(),
  ])

const tx = {
  type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
  from: walletAddress,
  to: contractAddress,
  data: encodedData,
  feeRatio: ratio,
  gas: gas,
}

caver.klay.signTransaction(tx, (err, res) => {
  if (err) {
    setSignError({
      success: false,
      message: _.toString(err.message),
    })
  } else {
    const { rawTransaction: senderRawTransaction } = JSON.parse(
      JSON.stringify(res)
    )
    setSignError(undefined)
    setSenderAddress(walletAddress)
    setSignedTx(senderRawTransaction)
  }
})`}
          />
        </View>
      </CardSection>
      {signError && <ResultForm title={'Error'} result={signError} />}
      {signedTx && (
        <CardSection>
          <ResultForm
            title={'Signed Transaction'}
            result={{ success: true, value: signedTx }}
          />
        </CardSection>
      )}
      {signedTx && (
        <FeeDelegation feeDelegationProps={{ walletAddress, signedTx }} />
      )}
    </>
  )
}

export default SmartContractExecutionTokenTransferFDwithRatio
