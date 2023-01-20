import { ReactElement, useMemo, useState } from 'react'
import Caver, { Keystore } from 'caver-js'
import _ from 'lodash'

import { URLMAP, UTIL, COLOR } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Container,
  Text,
  FormInput,
  CardSection,
  LinkA,
  PrivateKeyWarning,
  CodeBlock,
  View,
  FormRadio,
} from 'components'
import FormFile from 'components/FormFile'

import { exWKLAYAbi } from './constants/exWKLAYAbi'
import { exposureTime, contractAddress } from './constants/exWKLAYData'

enum FunctionEnum {
  BALANCE = 'Balance',
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  TRANSFEROFOWNER = 'Transfer of Owner',
  TRANSFEROFAPPROVER = 'Transfer of Approver',
  GETEVENTS = 'Get Events',
}

const WKLAY = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  const [ownerAddress, setOwnerAddress] = useState('')
  const [ownerKeystoreJSON, setOwnerKeystoreJSON] = useState<Keystore>()
  const [ownerKeystorePassword, setOwnerKeystorePassword] = useState('')
  const [ownerDecryptMessage, setOwnerDecryptMessage] = useState('')

  const [approverAddress, setApproverAddress] = useState('')
  const [approverKeystoreJSON, setApproverKeystoreJSON] = useState<Keystore>()
  const [approverKeystorePassword, setApproverKeystorePassword] = useState('')
  const [approverDecryptMessage, setApproverDecryptMessage] = useState('')

  const [balanceMsg, setBalanceMsg] = useState('')
  const [balanceButtonDisabled, setBalanceButtonDisabled] = useState(false)
  const [balanceSuccess, setBalanceSuccess] = useState(false)

  const [belowPage, setBelowPage] = useState<FunctionEnum>(FunctionEnum.BALANCE)

  const handleOwnerKeystoreChange = (files?: FileList): void => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event): void => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setOwnerKeystoreJSON(json)
        }
      }
    }
  }

  const decryptOwnerKeystore = (): void => {
    try {
      if (ownerKeystoreJSON) {
        const keyring = caver.wallet.keyring.decrypt(
          ownerKeystoreJSON,
          ownerKeystorePassword
        )

        if (caver.wallet.isExisted(keyring.address)) {
          caver.wallet.updateKeyring(keyring)
        } else {
          caver.wallet.add(keyring)
        }

        setOwnerDecryptMessage('Decryption succeeds!')
        setOwnerAddress(keyring.address)
      } else {
        throw Error('Owner Keystore is not uploaded!')
      }
    } catch (err) {
      setOwnerDecryptMessage(_.toString(err))
      setOwnerAddress('')

      setTimeout(() => {
        setOwnerDecryptMessage('')
      }, exposureTime)
    }
  }

  const handleApproverKeystoreChange = (files?: FileList): void => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event): void => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setApproverKeystoreJSON(json)
        }
      }
    }
  }

  const decryptApproverKeystore = (): void => {
    try {
      if (approverKeystoreJSON) {
        const keyring = caver.wallet.keyring.decrypt(
          approverKeystoreJSON,
          approverKeystorePassword
        )

        if (caver.wallet.isExisted(keyring.address)) {
          caver.wallet.updateKeyring(keyring)
        } else {
          caver.wallet.add(keyring)
        }

        setApproverDecryptMessage('Decryption succeeds!')
        setApproverAddress(keyring.address)
      } else {
        throw Error('Approver Keystore is not uploaded!')
      }
    } catch (err) {
      setApproverDecryptMessage(_.toString(err))
      setApproverAddress('')

      setTimeout(() => {
        setApproverDecryptMessage('')
      }, exposureTime)
    }
  }

  const balance = async (): Promise<void> => {
    try {
      setBalanceButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        contractAddress
      )
      wklay.options.from = ownerAddress
      let balance = await wklay.call('balanceOf', ownerAddress)
      const newDepositMsg = `${balance}`

      if (balance) {
        setBalanceMsg(newDepositMsg)
        setBalanceButtonDisabled(false)
        setBalanceSuccess(true)
      } else {
        throw Error('Deposit is failed')
      }
    } catch (err) {
      setBalanceMsg(_.toString(err))
      setBalanceButtonDisabled(false)
      setBalanceSuccess(false)

      setTimeout(() => {
        setBalanceMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">
            Interact with Deployed Contracts - Canonical WKLAY
          </h3>
          <Text>
            To make the user experience more efficient and reduce friction when
            moving KLAY between DApps, we have released Canonical WKLAY, a
            standard interface for using Wrapped Klay in dApps. For dApp
            standardization and more secure smart contracts, we want our
            partners to join us in using a standard implementation of WKLAY so
            that end users can convert KLAY to WKLAY once and use the same WKLAY
            in their dApps. You can easily test the Canonical WKLAY functions
            before actually making the service. You are able to find more
            information about Canonical WKLAY:{' '}
            <LinkA link="https://github.com/klaytn/canonical-wklay">
              Canonical WKLAY Contract Github
            </LinkA>
            {'\n\n'}
            Deployed Contract Addresses{'\n'}
            Mainnet:{' '}
            <LinkA link="https://scope.klaytn.com/account/0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432?tabId=internalTx">
              0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432
            </LinkA>
            {'\n'}
            Testnet:{' '}
            <LinkA link="https://baobab.scope.klaytn.com/account/0x043c471bEe060e00A56CcD02c0Ca286808a5A436?tabId=internalTx">
              0x043c471bEe060e00A56CcD02c0Ca286808a5A436
            </LinkA>{' '}
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <h3 className="title">
            {' '}
            Upload Keystore File of Owner of the WKLAY Balance
          </h3>
          <View style={{ marginBottom: 10 }}>
            <Text>
              Upload the Keystore file. This account must have enough KLAY to
              send transactions.
            </Text>
          </View>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <CardSection>
            <Label>Keystore</Label>
            <FormFile
              placeholder="Keystore File"
              accept=".json"
              onChange={handleOwnerKeystoreChange}
            />
          </CardSection>
          <CardSection>
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setOwnerKeystorePassword}
              value={ownerKeystorePassword}
            />
          </CardSection>
          <CardSection>
            <View style={{ marginBottom: 10 }}>
              <Button onClick={decryptOwnerKeystore}>Decrypt</Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`import { Keystore } from 'caver-js'
keystoreJSON: Keystore
password: string

const keyring = caver.wallet.keyring.decrypt(keystoreJSON, password)`}
            />
          </CardSection>
          {ownerDecryptMessage &&
            (!!ownerAddress ? (
              <CardSection>
                <Text>{ownerDecryptMessage}</Text>
              </CardSection>
            ) : (
              <CardSection>
                <Text style={{ color: COLOR.error }}>
                  {ownerDecryptMessage}
                </Text>
              </CardSection>
            ))}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h3 className="title">
            {' '}
            Upload Keystore File of Approver of the WKLAY Balance
          </h3>
          <View style={{ marginBottom: 10 }}>
            <Text>
              Upload the Keystore file. This account must have enough KLAY to
              send transactions.
            </Text>
          </View>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <CardSection>
            <Label>Keystore</Label>
            <FormFile
              placeholder="Keystore File"
              accept=".json"
              onChange={handleApproverKeystoreChange}
            />
          </CardSection>
          <CardSection>
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setApproverKeystorePassword}
              value={approverKeystorePassword}
            />
          </CardSection>
          <CardSection>
            <View style={{ marginBottom: 10 }}>
              <Button onClick={decryptApproverKeystore}>Decrypt</Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`import { Keystore } from 'caver-js'
keystoreJSON: Keystore
password: string

const keyring = caver.wallet.keyring.decrypt(keystoreJSON, password)`}
            />
          </CardSection>
          {approverDecryptMessage &&
            (!!approverAddress ? (
              <CardSection>
                <Text>{approverDecryptMessage}</Text>
              </CardSection>
            ) : (
              <CardSection>
                <Text style={{ color: COLOR.error }}>
                  {approverDecryptMessage}
                </Text>
              </CardSection>
            ))}
        </CardBody>
      </Card>
      {ownerDecryptMessage && (
        <FormRadio
          itemList={[{ title: 'Balance', value: FunctionEnum.BALANCE }]}
          selectedValue={belowPage}
          onClick={setBelowPage}
        />
      )}
      {ownerDecryptMessage && belowPage === 'Balance' && (
        <Card>
          <CardHeader>
            <h3 className="title">Balance of WKLAY</h3>
            <Text>Check the balance of WKLAY of the owner's address.</Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={balanceButtonDisabled} onClick={balance}>
                  Get Balance
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`
                //////////////////////////////
                `}
              />
            </CardSection>
            {!!balanceMsg && (
              <CardSection>
                {balanceSuccess ? (
                  <Text>{balanceMsg}</Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {balanceMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
    </Container>
  )
}

export default WKLAY
