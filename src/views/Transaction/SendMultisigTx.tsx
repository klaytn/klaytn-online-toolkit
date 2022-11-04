import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'
import Caver, { Keystore, MultipleKeyring, SingleKeyring } from 'caver-js'
import _ from 'lodash'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { URLMAP, UTIL, COLOR } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Column,
  Text,
  FormSelect,
  CardSection,
  FormInput,
  LinkA,
  FormFile,
  FormRadio,
  View,
} from 'components'
const delay: number = 3000

const FormChildBlock = styled.div`
  display: flex;
  align-items: center;
  width: 50%;
`
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

type KeystoreType = {
  privateKeys: string[]
  filename: string
}
type SuccessMsgType = {
  msg: string
  success: boolean
  child?: ReactNode
}

type NetworkType = 'mainnet' | 'testnet'

const SendMultiSigTx = (): ReactElement => {
  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [senderAddress, setSenderAddress] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [senderKeystoreJSON, setSenderKeystoreJSON] = useState<Keystore>()
  const [keystoreFileName, setKeystoreFileName] = useState('')
  const [senderKeystorePassword, setSenderKeystorePassword] = useState('')
  const [tokenType, setTokenType] = useState<TokenTypeEnum>(TokenTypeEnum.KLAY)
  const [decryptMsg, setDecryptMsg] = useState<SuccessMsgType>()
  const [keyList, setKeyList] = useState<KeystoreType[]>([])
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [resultMsg, setResultMsg] = useState<SuccessMsgType>()
  const [amount, setAmount] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [rawTx, setRawTx] = useState('')
  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDecryptMsg(undefined)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [decryptMsg])

  const handleSenderKeystoreChange = (files?: FileList): void => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event) => {
        try {
          if (typeof event.target?.result === 'string') {
            const json = UTIL.jsonTryParse<Keystore>(event.target.result)
            setSenderKeystorePassword('')
            if (!!json) {
              setSenderKeystoreJSON(json)
              setKeystoreFileName(files[0].name)
            } else {
              throw Error(
                'Failed to parse json file. Please check keystore file again.'
              )
            }
          }
        } catch (err) {
          setDecryptMsg({
            success: false,
            msg: _.toString(err),
          })
        }
      }
    }
  }

  const decryptSenderKeystore = (): void => {
    try {
      if (!!senderKeystoreJSON) {
        const keyring = caver.wallet.keyring.decrypt(
          senderKeystoreJSON,
          senderKeystorePassword
        )
        const privKeyList: string[] = []
        if (keyring.type === 'SingleKeyring') {
          privKeyList.push((keyring as SingleKeyring).key.privateKey)
        } else if (keyring.type === 'MultipleKeyring') {
          for (const element of (keyring as MultipleKeyring).keys) {
            privKeyList.push(element.privateKey)
          }
        } else if (keyring.type === 'RoleBasedKeyring') {
          const txRoleKeys = keyring.getKeyByRole(
            caver.wallet.keyring.role.roleTransactionKey
          )
          for (const element of txRoleKeys) {
            privKeyList.push(element.privateKey)
          }
        }
        setDecryptMsg({
          msg: 'Decryption succeeds!',
          success: true,
        })
        setKeyList([
          ...keyList,
          { privateKeys: privKeyList, filename: keystoreFileName },
        ])
      } else {
        throw Error('Keystore is not uploaded!')
      }
    } catch (err) {
      setDecryptMsg({ success: false, msg: _.toString(err) })
    }
  }

  const handleKeystoreRemove = (index: number): void => {
    const privKeyList = [...keyList]
    privKeyList.splice(index, 1)
    setKeyList(privKeyList)
  }

  const onSignTxButtonClick = async (): Promise<void> => {
    try {
      setButtonDisabled(true)
      let storedKeys: string[] = []
      for (const element of keyList) {
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
        const value = BigNumber(_.toNumber(amount) * Math.pow(10, decimal))
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
              link={`${URLMAP.network[network]['finder']}${vtReceipt.transactionHash}`}
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
        </CardHeader>
        <CardBody>
          <h3 className="title">Transaction Information</h3>
          <Text>
            Select Mainnet or Testnet. Enter the sender address, recipient
            address, and KLAY amount. If you'd like to transfer KIP-7 or ERC-20
            token, enter the contract address and token amount instead of KLAY
            amount.
          </Text>
          <CardSection>
            <Label>Network</Label>
            <FormSelect
              defaultValue={network}
              itemList={[
                { value: 'mainnet', label: 'Mainnet' },
                { value: 'testnet', label: 'Testnet' },
              ]}
              onChange={setNetwork}
            />
            <Label>Sender</Label>
            <FormInput
              placeholder="Sender Address"
              onChange={setSenderAddress}
              value={senderAddress}
            />
            <Label>Recipient</Label>
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

          {!!resultMsg && <SuccessMsgForm result={resultMsg} />}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="title">Upload Keystore File</h3>
          <Text>
            You need private keys to sign transaction. Upload here keystore
            files to be used for private keys. Once decryption succeeds, you can
            see filename added in decrypted keystore list below.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Keystore</Label>
            <FormFile
              placeholder="Keystore File"
              accept=".json"
              onChange={handleSenderKeystoreChange}
            />
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setSenderKeystorePassword}
              value={senderKeystorePassword}
            />
            <Button onClick={decryptSenderKeystore}>Decrypt</Button>
          </CardSection>
          {!!decryptMsg && <SuccessMsgForm result={decryptMsg} />}
          <CardSection>
            <Label>Decrypted Keystore List </Label>
            {keyList.length > 0 ? (
              keyList.map((_, index: number) => (
                <FormBlock>
                  <FormChildBlock>
                    <Text>{keyList[index].filename}</Text>
                  </FormChildBlock>
                  <FormChildBlock>
                    <Button onClick={() => handleKeystoreRemove(index)}>
                      Remove
                    </Button>
                  </FormChildBlock>
                </FormBlock>
              ))
            ) : (
              <Text style={{ color: COLOR.error }}>
                There's no keystore uploaded.
              </Text>
            )}
          </CardSection>
        </CardBody>
      </Card>
    </Column>
  )
}

export default SendMultiSigTx
