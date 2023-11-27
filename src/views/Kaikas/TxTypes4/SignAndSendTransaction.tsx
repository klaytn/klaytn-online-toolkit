import { ReactElement, useEffect, useState } from 'react'
import Caver, { RLPEncodedTransaction, TransactionForSendRPC } from 'caver-js'

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
import { exWKLAYAbi } from 'views/Miscellaneous/constants/exWKLAYAbi'
import { wklayContractAddress } from 'views/Miscellaneous/constants/exMulticallData'

const signer = new Caver(window.klaytn)

type WalletInfoType = {
  walletProps: {
    walletAddress: string
  }
}

interface SignedTransaction extends RLPEncodedTransaction {
  rawTransaction: string
}

const SignAndSendTransaction = ({
  walletProps,
}: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps

  const [wklayAmount, setWklayAmount] = useState('')
  const [amount, setAmount] = useState('')
  const [signResult, setSignResult] = useState<ResultFormType>()
  const [rawTransaction, setRawTransaction] = useState('')
  const [sendResult, setSendResult] = useState<ResultFormType>()
  const [isLoading, setIsLoading] = useState(false)

  const call = async (): Promise<void> => {
    const wklayJsonInterface = JSON.parse(JSON.stringify(exWKLAYAbi))
    const wklay = new signer.contract(wklayJsonInterface, wklayContractAddress)
    const res = await wklay.methods.balanceOf(walletAddress).call()
    setWklayAmount(res)
  }

  useEffect(() => {
    if (sendResult?.success) {
      call()
    }
  }, [sendResult])

  const sign = async (): Promise<void> => {
    try {
      const encodedData = signer.klay.abi.encodeFunctionCall(
        {
          constant: false,
          inputs: [],
          name: 'deposit',
          outputs: [],
          payable: true,
          stateMutability: 'payable',
          type: 'function',
        },
        []
      )
      const nonce = await signer.klay.getTransactionCount(walletAddress)
      const gasPrice = await signer.klay.getGasPrice()

      const txObject = {
        type: 'SMART_CONTRACT_EXECUTION',
        from: walletAddress,
        to: '0x043c471bee060e00a56ccd02c0ca286808a5a436',
        data: encodedData,
        nonce: Number(nonce),
        gas: '100000',
        gasPrice: gasPrice,
        chainId: 1001,
        value: signer.utils.toPeb(amount, 'KLAY'),
      }

      const res = (await signer.rpc.klay.signTransaction(
        txObject as TransactionForSendRPC
      )) as SignedTransaction
      setSignResult({ success: true, value: JSON.stringify(res, null, 2) })
      setRawTransaction(res.rawTransaction)
    } catch (err) {
      setSignResult({
        success: false,
        message: 'Please input the appropriate values and sign it.',
      })
    }
  }

  const send = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const res = await signer.rpc.klay.sendRawTransaction(rawTransaction)
      setIsLoading(false)
      setSendResult({ success: true, value: JSON.stringify(res, null, 2) })
    } catch (err) {
      setSendResult({
        success: false,
        message: 'Fail to send raw transaction',
      })
    }
  }

  return (
    <>
      <CardSection>
        <Label>
          Get the Amount of wKLAY in the Currently Connected Address
        </Label>
        <View style={{ rowGap: 10 }}>
          <Button onClick={call}>Call</Button>
          <CodeBlock
            title="caver-js code"
            text={`const wklay = new signer.contract(wklayJsonInterface, wklayContractAddress)
const res = await wklay.methods.balanceOf(walletAddress).call()`}
          />
        </View>
      </CardSection>
      {wklayAmount && (
        <CardSection>
          <ResultForm
            title={'Amount of wKLAY'}
            result={{
              success: true,
              value: signer.utils.fromPeb(wklayAmount),
            }}
          />
        </CardSection>
      )}

      <CardSection>
        <Label>Sign Transaction</Label>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>Deposit KLAY Amount to get wKLAY</Label>
            <FormInput
              type="number"
              placeholder="Deposit KLAY Amount (Unit: KLAY)"
              onChange={setAmount}
              value={amount}
            />
          </View>
          <Button onClick={sign}>Sign Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const encodedData = signer.klay.abi.encodeFunctionCall(
  {
    constant: false,
    inputs: [],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  []
)
const nonce = await signer.klay.getTransactionCount(walletAddress)
const gasPrice = await signer.klay.getGasPrice()

const txObject = {
  type: 'SMART_CONTRACT_EXECUTION',
  from: walletAddress,
  to: '0x043c471bee060e00a56ccd02c0ca286808a5a436',
  data: encodedData,
  nonce: Number(nonce),
  gas: '100000',
  gasPrice: gasPrice,
  chainId: 1001,
  value: signer.utils.toPeb(amount, 'KLAY'),
}

const res = (await signer.rpc.klay.signTransaction(
  txObject as TransactionForSendRPC
)) as SignedTransaction`}
          />
        </View>
      </CardSection>
      {signResult && (
        <CardSection>
          {signResult.success === true && (
            <ResultForm title={'Signed Transaction Info'} result={signResult} />
          )}
          {signResult && signResult.success === false && (
            <ResultForm title={'Error'} result={signResult} />
          )}
        </CardSection>
      )}
      {signResult?.success && (
        <CardSection>
          <Label>Send Transaction</Label>
          <View style={{ rowGap: 10 }}>
            <Button onClick={send}>Send Transaction</Button>
            <CodeBlock
              title="caver-js code"
              text={`const res = await signer.rpc.klay.sendRawTransaction(rawTransaction)`}
            />
          </View>
        </CardSection>
      )}
      {isLoading && (
        <CardSection>
          <Label>{`The transaction is being processed...`}</Label>
        </CardSection>
      )}
      {sendResult && (
        <CardSection>
          {sendResult.success === true && (
            <ResultForm title={'Transaction Receipt'} result={sendResult} />
          )}
          {sendResult && sendResult.success === false && (
            <ResultForm title={'Error'} result={sendResult} />
          )}
        </CardSection>
      )}
    </>
  )
}

export default SignAndSendTransaction
