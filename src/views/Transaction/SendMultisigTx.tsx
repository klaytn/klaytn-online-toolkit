import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'
import styled from 'styled-components'

import { URLMAP, UTIL, COLOR } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Column,
  Text,
  CardSection,
  FormInput,
  LinkA,
  FormRadio,
  View,
  PrivateKeyWarning,
} from 'components'
import { KeystoreType } from './components/GetMultipleKeysSection'
import GetMultipleKeysSection from './components/GetMultipleKeysSection'

const FormBlock = styled.div`
  display: flex;
  margin-bottom: 5px;
`

const SuccessMsgForm = ({
  result,
  title,
}: {
  result?: SuccessMsgType
  title?: string
}): ReactElement => {
  return (
    <>
      {!!result && (
        <CardSection>
          {result.success ? (
            <View>
              <Label>{title || 'Result'}</Label>
              <Text>{result.msg}</Text>
              {!!result?.child && result.child}
            </View>
          ) : (
            <Text style={{ color: COLOR.error }}>{result.msg}</Text>
          )}
        </CardSection>
      )}
    </>
  )
}

enum TokenTypeEnum {
  KLAY = 'KLAY',
  FT = 'KIP-7/ERC-20',
}

type SuccessMsgType = {
  msg: string
  success: boolean
  child?: ReactNode
}

const SendMultiSigTx = (): ReactElement => {
  const [senderAddress, setSenderAddress] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [tokenType, setTokenType] = useState<TokenTypeEnum>(TokenTypeEnum.KLAY)
  const [keyList, setKeyList] = useState<KeystoreType[]>([])
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [resultMsg, setResultMsg] = useState<SuccessMsgType>()
  const [amount, setAmount] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [rawTx, setRawTx] = useState('')
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  useEffect(() => {
    setResultMsg(undefined)
  }, [senderAddress, recipientAddress, amount, contractAddress, tokenType])

  const onSignTxButtonClick = async (): Promise<void> => {
    try {
      setButtonDisabled(true)
      let storedKeys: string[] = []
      for (const element of keyList) {
        console.log('elemeng:', element)
        storedKeys.push(...element.privateKeys)
      }
      const newKeyring = caver.wallet.keyring.createWithMultipleKey(
        senderAddress,
        storedKeys
      )
      if (caver.wallet.isExisted(senderAddress)) {
        caver.wallet.updateKeyring(newKeyring)
      } else {
        caver.wallet.add(newKeyring) // caver wallet add keyring if keyring hasn't been updated.
      }

      let signed
      if (tokenType === TokenTypeEnum.KLAY) {
        //KLAY
        const vt = caver.transaction.valueTransfer.create({
          from: senderAddress,
          to: recipientAddress,
          value: caver.utils.toPeb(amount, 'KLAY'),
          gas: 1000000,
        })
        signed = await caver.wallet.sign(senderAddress, vt)
      } else {
        //KIP-7 & ERC20
        const contractInstance = new caver.kct.kip7(contractAddress)
        const decimal = await contractInstance.decimals()
        const value = UTIL.toBn(amount).multipliedBy(Math.pow(10, decimal))
        signed = await contractInstance.sign(
          { from: senderAddress, gas: 1000000 },
          'transfer',
          recipientAddress,
          value
        )
      }
      setRawTx(signed.getRawTransaction())
      setButtonDisabled(false)
      setResultMsg({
        msg: 'Transaction is signed! ',
        success: true,
      })
    } catch (err) {
      setButtonDisabled(false)
      setResultMsg({
        success: false,
        msg: _.toString(err),
      })
    }
  }

  const onSendTxButtonClick = async (): Promise<void> => {
    try {
      setButtonDisabled(true)
      const vtReceipt = await caver.rpc.klay.sendRawTransaction(rawTx)
      setResultMsg({
        msg: `Transaction is confirmed! `,
        success: true,
        child: (
          <Text>
            {'Transaction Hash: '}
            <LinkA
              link={`${URLMAP.network['testnet']['finder']}${vtReceipt.transactionHash}`}
            >
              {vtReceipt.transactionHash}
            </LinkA>
          </Text>
        ),
      })
      setButtonDisabled(false)
    } catch (err) {
      setButtonDisabled(false)
      setResultMsg({ success: false, msg: _.toString(err) })
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title"> Send MultiSig Transaction </h3>
          <Text>
            This page is for sending a value transfer transaction with a{' '}
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyweightedmultisig">
              multisig account
            </LinkA>
            (the account that owns Multiple Signing Keys). You can use this page
            to transfer value with the account with{' '}
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyrolebased">
              role-based keys
            </LinkA>{' '}
            or a single key.
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <h3 className="title">Sender Information</h3>
          <Text>
            Enter the sender's address. Then upload keystore files or enter
            private keys to sign the transaction. If the decryption is
            successful, you will see the filename appended to the decrypted
            keystore list below.
          </Text>
          <CardSection>
            <Label>Sender Address</Label>
            <FormInput
              placeholder="Sender Address"
              onChange={setSenderAddress}
              value={senderAddress}
            />
          </CardSection>
          <GetMultipleKeysSection keyList={keyList} setKeyList={setKeyList} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="title">Transaction Information</h3>
          <Text>
            Enter the recipient's address and KLAY amount. If you'd like to
            transfer KIP-7 or ERC-20 token, enter the contract address and token
            amount instead of KLAY amount.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <CardSection>
            <Label>Recipient Address</Label>
            <FormInput
              placeholder="Recipient Address"
              onChange={setRecipientAddress}
              value={recipientAddress}
            />
            <FormRadio
              itemList={[
                { title: 'KLAY', value: TokenTypeEnum.KLAY },
                { title: 'KIP-7/ERC-20', value: TokenTypeEnum.FT },
              ]}
              selectedValue={tokenType}
              onClick={setTokenType}
            />
            {tokenType === TokenTypeEnum.FT && (
              <>
                <Label>Contract Address</Label>
                <FormInput
                  placeholder="Contract Address"
                  onChange={setContractAddress}
                  value={contractAddress}
                />
              </>
            )}
            <Label>
              Amount{' '}
              {`(Unit: ${
                tokenType === TokenTypeEnum.KLAY
                  ? 'KLAY'
                  : 'Base unit of a token'
              })`}
            </Label>
            <FormInput
              placeholder="Amount"
              onChange={setAmount}
              value={amount}
            />
            <FormBlock>
              <Button disabled={buttonDisabled} onClick={onSignTxButtonClick}>
                Sign Transaction
              </Button>
              <Button disabled={buttonDisabled} onClick={onSendTxButtonClick}>
                Send Transaction
              </Button>
            </FormBlock>
          </CardSection>
          <SuccessMsgForm result={resultMsg} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default SendMultiSigTx
