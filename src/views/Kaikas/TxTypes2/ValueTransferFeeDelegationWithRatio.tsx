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

import FeeDelegation from '../Common/FeeDelegation'

const caver = new Caver(window.klaytn)

type WalletInfoType = {
  walletProps: {
    walletAddress: string
  }
}

const ValueTransferFeeDelegationWithRatio = ({
  walletProps,
}: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps
  const [senderAddress, setSenderAddress] = useState('')

  const [toAddress, setToAddress] = useState('')
  const [value, setValue] = useState('')
  const [gas, setGas] = useState('3000000')
  const [ratio, setRatio] = useState('')

  const [signError, setSignError] = useState<ResultFormType>()
  const [signedTx, setSignedTx] = useState('')

  const signTransaction = (): void => {
    try {
      const txData = {
        type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
        from: walletAddress,
        to: toAddress,
        value: caver.utils.toPeb(value, 'KLAY'),
        feeRatio: ratio,
        gas: gas,
      }

      caver.klay.signTransaction(txData, (err, res) => {
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
        <h4>Value Transfer (Fee Delegation with Ratio)</h4>
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
            <Label>Fee Ratio</Label>
            <FormInput
              type="text"
              placeholder="Fee Ratio (%)"
              onChange={setRatio}
              value={ratio}
            />
            <Label>Gas</Label>
            <FormInput
              type="text"
              placeholder="Gas (Peb)"
              onChange={setGas}
              value={gas}
            />
          </View>
          <Button onClick={signTransaction}>Sign Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const txData = {
  type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
  from: walletAddress,
  to: toAddress,
  value: caver.utils.toPeb(value, 'KLAY'),
  feeRatio: ratio,
  gas: gas,
}

caver.klay.signTransaction(txData, (err, res) => {
  if (err) {
    setSignError({ success: false, message: _.toString(err.message) })
  } else {
    const { rawTransaction: senderRawTransaction } = JSON.parse(JSON.stringify(res))
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

export default ValueTransferFeeDelegationWithRatio
