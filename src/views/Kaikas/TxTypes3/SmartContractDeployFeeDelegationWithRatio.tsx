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
  CardExample,
} from 'components'

import exBytecode from '../Common/exBytecode'
import FeeDelegation from '../Common/FeeDelegation'

const caver = new Caver(window.klaytn)

type WalletInfoType = {
  walletProps: {
    walletAddress: string
  }
}

const SmartContractDeployFeeDelegationWithRatio = ({
  walletProps,
}: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps
  const [senderAddress, setSenderAddress] = useState('')

  const [bytecode, setBytecode] = useState('')
  const [value, setValue] = useState('')
  const [ratio, setRatio] = useState('')
  const [gas, setGas] = useState('3000000')

  const [signError, setSignError] = useState<ResultFormType>()
  const [signedTx, setSignedTx] = useState('')

  const signTransaction = (): void => {
    try {
      const tx = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
        from: walletAddress,
        data: bytecode,
        value: caver.utils.toPeb(value, 'KLAY'),
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
        <h4>Smart Contract Deploy (Fee Delegation with Ratio)</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>From</Label>
            <FormInput
              type="text"
              placeholder="Address you want to sign transaction"
              onChange={(): void => {}}
              value={senderAddress || walletAddress}
            />
            <Label>
              Bytecode Example (GX Token contract). You can deploy 9999 GroundX
              Tokens.
            </Label>
            <CardExample
              exValue={exBytecode}
              onClickTry={() => {
                setBytecode(exBytecode)
                setValue('0')
              }}
            />
            <Label>Data (bytecode)</Label>
            <FormInput
              type="text"
              placeholder="A bytecode of smart contract to be deployed"
              onChange={setBytecode}
              value={bytecode}
            />
            <Label>Value</Label>
            <FormInput
              type="text"
              placeholder="Value (KLAY)"
              onChange={setValue}
              value={value}
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
const tx = {
  type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
  from: walletAddress,
  data: bytecode,
  value: caver.utils.toPeb(value, 'KLAY'),
  feeRatio: ratio,
  gas: gas
}

caver.klay.signTransaction(tx, (err, res) => {
  if (err) {
    setSignError({ success: false, message: _.toString(err.message) })
  } else {
    const { rawTransaction: senderRawTransaction } = JSON.parse(JSON.stringify(res))
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

export default SmartContractDeployFeeDelegationWithRatio
