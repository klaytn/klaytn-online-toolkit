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

const AccountUpdateFeeDelegationWithRatio = ({
  walletProps,
}: WalletInfoType): ReactElement => {
  const { walletAddress } = walletProps
  const [senderAddress, setSenderAddress] = useState('')

  const [ratio, setRatio] = useState('')
  const [gas, setGas] = useState('3000000')

  const [signError, setSignError] = useState<ResultFormType>()
  const [signedTx, setSignedTx] = useState('')

  const [walletKey, setWalletKey] = useState('')
  const [publicKey, setPublicKey] = useState('')

  const signTransaction = (): void => {
    try {
      const tx = {
        type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
        from: walletAddress,
        gas: gas,
        publicKey: publicKey,
        feeRatio: ratio,
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
        <h4>Account Update (Fee Delegation with Ratio)</h4>
        <View style={{ rowGap: 10 }}>
          <View>
            <Label>From</Label>
            <FormInput
              type="text"
              placeholder="Address you want to update"
              onChange={(): void => {}}
              value={senderAddress || walletAddress}
            />
            <Label>New Public Key</Label>
            <FormInput
              type="text"
              placeholder="New Public Key"
              onChange={setPublicKey}
              value={publicKey}
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
              placeholder="Gas (Peb)"
              onChange={setGas}
              value={gas}
            />
          </View>
          <Button onClick={signTransaction}>Sign Transaction</Button>
          <CodeBlock
            title="caver-js code"
            text={`const caver = new Caver(window.klaytn)

const tx = {
  type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
  from: walletAddress,
  gas: gas,
  publicKey: publicKey,
  feeRatio: ratio
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

export default AccountUpdateFeeDelegationWithRatio
