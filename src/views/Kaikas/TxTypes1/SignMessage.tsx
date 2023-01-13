import { ReactElement, useState } from 'react'
import Caver from 'caver-js'

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

const SignMessage = ({ walletProps }: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps
  const [message, setMessage] = useState('Hello, world!')
  const [result, setResult] = useState<ResultFormType>()

  const sign = async (): Promise<void> => {
    try {
      const signedMessage = await caver.klay.sign(message, walletAddress)
      setResult({ success: true, value: signedMessage })
    } catch (err) {
      setResult({
        success: false,
        message: 'Please input the appropriate values and sign it.',
      })
    }
  }

  return (
    <>
      <CardSection>
        <h4>Sign Message</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>From</Label>
            <FormInput
              type="text"
              placeholder="Address you logged in kaikas"
              onChange={(): void => {}}
              value={walletAddress}
            />
            <Label>Message</Label>
            <FormInput
              type="text"
              placeholder="Message you want to sign"
              onChange={setMessage}
              value={message}
            />
          </View>
          <Button onClick={sign}>Sign Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const signedMessage = await caver.klay.sign(message, walletAddress)
setResult({ success: true, value: signedMessage })`}
          />
        </View>
      </CardSection>
      {result && (
        <CardSection>
          {result.success === true && (
            <ResultForm title={'Signed Message'} result={result} />
          )}
          {result && result.success === false && (
            <ResultForm title={'Error'} result={result} />
          )}
        </CardSection>
      )}
    </>
  )
}

export default SignMessage
