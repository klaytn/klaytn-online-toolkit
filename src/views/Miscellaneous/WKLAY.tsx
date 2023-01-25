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
  APPROVE = 'Approve',
  TRANSFEROFOWNER = `Transfer of Owner's WKLAY`,
  TRANSFEROFAPPROVED = `Transfer of Owner's WKLAY Using Approved Account`,
  GETEVENTS = 'Get Events',
}

const WKLAY = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  const [ownerAddress, setOwnerAddress] = useState('')
  const [ownerKeystoreJSON, setOwnerKeystoreJSON] = useState<Keystore>()
  const [ownerKeystorePassword, setOwnerKeystorePassword] = useState('')
  const [ownerDecryptMessage, setOwnerDecryptMessage] = useState('')

  const [approvedAddress, setApprovedAddress] = useState('')
  const [approvedKeystoreJSON, setApprovedKeystoreJSON] = useState<Keystore>()
  const [approvedKeystorePassword, setApprovedKeystorePassword] = useState('')
  const [approvedDecryptMessage, setApprovedDecryptMessage] = useState('')

  const [balanceMsg, setBalanceMsg] = useState('')
  const [balanceButtonDisabled, setBalanceButtonDisabled] = useState(false)
  const [balanceSuccess, setBalanceSuccess] = useState(false)

  const [depositKlayAmount, setDepositKlayAmount] = useState('')
  const [depositMsg, setDepositMsg] = useState('')
  const [depositButtonDisabled, setDepositButtonDisabled] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [depositTxHash, setDepositTxHash] = useState('')

  const [withdrawKlayAmount, setWithdrawKlayAmount] = useState('')
  const [withdrawMsg, setWithdrawMsg] = useState('')
  const [withdrawButtonDisabled, setWithdrawButtonDisabled] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [withdrawTxHash, setWithdrawTxHash] = useState('')

  const [transferAddress, setTransferAddress] = useState('')
  const [transferKlayAmount, setTransferKlayAmount] = useState('')
  const [transferMsg, setTransferMsg] = useState('')
  const [transferButtonDisabled, setTransferButtonDisabled] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [transferTxHash, setTransferTxHash] = useState('')

  const [approvedKlayAmount, setApprovedKlayAmount] = useState('')
  const [approvedMsg, setApprovedMsg] = useState('')
  const [approvedButtonDisabled, setApprovedButtonDisabled] = useState(false)
  const [approvedSuccess, setApprovedSuccess] = useState(false)
  const [approvedTxHash, setApprovedTxHash] = useState('')

  const [allowanceMsg, setAllowanceMsg] = useState('')
  const [allowanceButtonDisabled, setAllowanceButtonDisabled] = useState(false)
  const [allowanceSuccess, setAllowanceSuccess] = useState(false)

  const [approvedTransferAddress, setApprovedTransferAddress] = useState('')
  const [approvedTransferKlayAmount, setApprovedTransferKlayAmount] =
    useState('')
  const [approvedTransferMsg, setApprovedTransferMsg] = useState('')
  const [approvedTransferButtonDisabled, setApprovedTransferButtonDisabled] =
    useState(false)
  const [approvedTransferSuccess, setApprovedTransferSuccess] = useState(false)
  const [approvedTransferTxHash, setApprovedTransferTxHash] = useState('')

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

  const handleApprovedKeystoreChange = (files?: FileList): void => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event): void => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setApprovedKeystoreJSON(json)
        }
      }
    }
  }

  const decryptApprovedKeystore = (): void => {
    try {
      if (approvedKeystoreJSON) {
        const keyring = caver.wallet.keyring.decrypt(
          approvedKeystoreJSON,
          approvedKeystorePassword
        )

        if (caver.wallet.isExisted(keyring.address)) {
          caver.wallet.updateKeyring(keyring)
        } else {
          caver.wallet.add(keyring)
        }

        setApprovedDecryptMessage('Decryption succeeds!')
        setApprovedAddress(keyring.address)
      } else {
        throw Error(`Approved account's Keystore is not uploaded!`)
      }
    } catch (err) {
      setApprovedDecryptMessage(_.toString(err))
      setApprovedAddress('')

      setTimeout(() => {
        setApprovedDecryptMessage('')
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
      const returnedBalance = await wklay.call('balanceOf', ownerAddress)

      if (returnedBalance) {
        setBalanceMsg(
          `${caver.utils.convertFromPeb(returnedBalance, 'KLAY')} WKLAY`
        )
        setBalanceButtonDisabled(false)
        setBalanceSuccess(true)
      } else {
        throw Error('Checking balance is failed')
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

  const deposit = async (): Promise<void> => {
    try {
      setDepositButtonDisabled(true)

      const tx = caver.transaction.legacyTransaction.create({
        from: ownerAddress,
        to: contractAddress,
        value: caver.utils.toPeb(depositKlayAmount, 'KLAY'),
        gas: 1000000,
      })

      const signedTx = await caver.wallet.sign(ownerAddress, tx)
      await signedTx.fillTransaction()
      const receipt = await caver.rpc.klay.sendRawTransaction(
        signedTx.getRawTransaction()
      )
      setDepositTxHash(receipt.transactionHash)

      const newDepositMsg = `Deposit is successfully executed.`

      if (newDepositMsg) {
        setDepositMsg(newDepositMsg)
        setDepositButtonDisabled(false)
        setDepositSuccess(true)
      } else {
        throw Error('Deposit is failed')
      }
    } catch (err) {
      setDepositMsg(_.toString(err))
      setDepositButtonDisabled(false)
      setDepositSuccess(false)

      setTimeout(() => {
        setDepositMsg('')
      }, exposureTime)
    }
  }

  const withdraw = async (): Promise<void> => {
    try {
      setWithdrawButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        contractAddress
      )
      wklay.options.from = ownerAddress
      const receipt = await wklay.send(
        { from: ownerAddress, gas: 1000000 },
        'withdraw',
        caver.utils.toPeb(withdrawKlayAmount, 'KLAY')
      )

      setWithdrawTxHash(receipt.transactionHash)
      const newWithdrawMsg = `Withdraw is successfully executed.`

      if (newWithdrawMsg) {
        setWithdrawMsg(newWithdrawMsg)
        setWithdrawButtonDisabled(false)
        setWithdrawSuccess(true)
      } else {
        throw Error('Withdraw is failed')
      }
    } catch (err) {
      setWithdrawMsg(_.toString(err))
      setWithdrawButtonDisabled(false)
      setWithdrawSuccess(false)

      setTimeout(() => {
        setWithdrawMsg('')
      }, exposureTime)
    }
  }
  const transfer = async (): Promise<void> => {
    try {
      setTransferButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        contractAddress
      )
      wklay.options.from = ownerAddress
      const receipt = await wklay.send(
        { from: ownerAddress, gas: 1000000 },
        'transfer',
        transferAddress,
        caver.utils.toPeb(transferKlayAmount, 'KLAY')
      )

      setTransferTxHash(receipt.transactionHash)
      const newTransferMsg = `Transfer of Owner's WKLAY is successfully executed.`

      if (newTransferMsg) {
        setTransferMsg(newTransferMsg)
        setTransferButtonDisabled(false)
        setTransferSuccess(true)
      } else {
        throw Error('Transfer is failed')
      }
    } catch (err) {
      setTransferMsg(_.toString(err))
      setTransferButtonDisabled(false)
      setTransferSuccess(false)

      setTimeout(() => {
        setTransferMsg('')
      }, exposureTime)
    }
  }
  const approve = async (): Promise<void> => {
    try {
      setApprovedButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        contractAddress
      )
      wklay.options.from = ownerAddress
      const receipt = await wklay.send(
        { from: ownerAddress, gas: 1000000 },
        'approve',
        approvedAddress,
        caver.utils.toPeb(approvedKlayAmount, 'KLAY')
      )

      setApprovedTxHash(receipt.transactionHash)
      const newApprovedMsg = `Approve is successfully executed.`

      if (newApprovedMsg) {
        setApprovedMsg(newApprovedMsg)
        setApprovedButtonDisabled(false)
        setApprovedSuccess(true)
      } else {
        throw Error('Approve is failed')
      }
    } catch (err) {
      setApprovedMsg(_.toString(err))
      setApprovedButtonDisabled(false)
      setApprovedSuccess(false)

      setTimeout(() => {
        setApprovedMsg('')
      }, exposureTime)
    }
  }
  const allowance = async (): Promise<void> => {
    try {
      setAllowanceButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        contractAddress
      )
      wklay.options.from = approvedAddress
      const returnedAllowance = await wklay.call(
        'allowance',
        ownerAddress,
        approvedAddress
      )

      if (returnedAllowance) {
        setAllowanceMsg(
          `${caver.utils.convertFromPeb(returnedAllowance, 'KLAY')} WKLAY`
        )
        setAllowanceButtonDisabled(false)
        setAllowanceSuccess(true)
      } else {
        throw Error('Checking allowance is failed')
      }
    } catch (err) {
      setAllowanceMsg(_.toString(err))
      setAllowanceButtonDisabled(false)
      setAllowanceSuccess(false)

      setTimeout(() => {
        setAllowanceMsg('')
      }, exposureTime)
    }
  }
  const approvedTransfer = async (): Promise<void> => {
    try {
      setApprovedTransferButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        contractAddress
      )
      wklay.options.from = approvedAddress
      const receipt = await wklay.send(
        { from: approvedAddress, gas: 1000000 },
        'transferFrom',
        ownerAddress,
        approvedTransferAddress,
        caver.utils.toPeb(approvedTransferKlayAmount, 'KLAY')
      )

      setApprovedTransferTxHash(receipt.transactionHash)
      const newApprovedTransferMsg = `Transfer of Owner's WKLAY Using Approved Account is successfully executed.`

      if (newApprovedTransferMsg) {
        setApprovedTransferMsg(newApprovedTransferMsg)
        setApprovedTransferButtonDisabled(false)
        setApprovedTransferSuccess(true)
      } else {
        throw Error('Transfer Using Approved Account is failed')
      }
    } catch (err) {
      setApprovedTransferMsg(_.toString(err))
      setApprovedTransferButtonDisabled(false)
      setApprovedTransferSuccess(false)

      setTimeout(() => {
        setApprovedTransferMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">
            Interact with a Deployed Contract - Canonical WKLAY
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
            </LinkA>{' '}
            and{' '}
            <LinkA link="https://medium.com/klaytn/announcing-canonical-wklay-569202665d02">
              Medium Article For Announcing Canonical WKLAY
            </LinkA>
            .{'\n\n'}
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
            Upload Keystore File of Approved Account of the WKLAY Balance
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
              onChange={handleApprovedKeystoreChange}
            />
          </CardSection>
          <CardSection>
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setApprovedKeystorePassword}
              value={approvedKeystorePassword}
            />
          </CardSection>
          <CardSection>
            <View style={{ marginBottom: 10 }}>
              <Button onClick={decryptApprovedKeystore}>Decrypt</Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`import { Keystore } from 'caver-js'
keystoreJSON: Keystore
password: string

const keyring = caver.wallet.keyring.decrypt(keystoreJSON, password)`}
            />
          </CardSection>
          {approvedDecryptMessage &&
            (!!approvedAddress ? (
              <CardSection>
                <Text>{approvedDecryptMessage}</Text>
              </CardSection>
            ) : (
              <CardSection>
                <Text style={{ color: COLOR.error }}>
                  {approvedDecryptMessage}
                </Text>
              </CardSection>
            ))}
        </CardBody>
      </Card>
      {ownerDecryptMessage && (
        <FormRadio
          itemList={[
            { title: 'Balance', value: FunctionEnum.BALANCE },
            { title: 'Deposit', value: FunctionEnum.DEPOSIT },
            { title: 'Withdraw', value: FunctionEnum.WITHDRAW },
            { title: 'Transfer', value: FunctionEnum.TRANSFEROFOWNER },
            { title: 'Approve', value: FunctionEnum.APPROVE },
            {
              title: 'Transfer Using Approved Account',
              value: FunctionEnum.TRANSFEROFAPPROVED,
            },
          ]}
          selectedValue={belowPage}
          onClick={setBelowPage}
        />
      )}
      {ownerDecryptMessage && belowPage === 'Balance' && (
        <Card>
          <CardHeader>
            <h3 className="title">Check the Balance of WKLAY</h3>
            <Text>Check the balance of WKLAY of the owner's address.</Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={balanceButtonDisabled} onClick={balance}>
                  Balance Check
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  contractAddress
)
wklay.options.from = ownerAddress

const returnedBalance = await wklay.call('balanceOf', ownerAddress)`}
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
      {ownerDecryptMessage && belowPage === 'Deposit' && (
        <Card>
          <CardHeader>
            <h3 className="title">Deposit KLAY</h3>
            <Text>Deposit the KLAY and get the WKLAY.</Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ rowGap: 10, marginBottom: 10 }}>
                <View>
                  <Label>KLAY</Label>
                  <FormInput
                    type="text"
                    placeholder="Amount of KLAY you want to deposit"
                    value={depositKlayAmount}
                    onChange={setDepositKlayAmount}
                  />
                </View>
                <Button disabled={depositButtonDisabled} onClick={deposit}>
                  Deposit
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const tx = caver.transaction.legacyTransaction.create({
  from: ownerAddress,
  to: contractAddress,
  value: caver.utils.toPeb(depositKlayAmount, 'KLAY'),
  gas: 1000000,
})

const signedTx = await caver.wallet.sign(ownerAddress, tx)
await signedTx.fillTransaction()
const receipt = await caver.rpc.klay.sendRawTransaction(
  signedTx.getRawTransaction()
)`}
              />
            </CardSection>
            {!!depositMsg && (
              <CardSection>
                {depositSuccess ? (
                  <Text>
                    {depositMsg} You can check it below link:
                    <br />
                    <LinkA
                      link={`${URLMAP.network['testnet']['scope']}${depositTxHash}`}
                    >
                      Block Explorer
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {depositMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {ownerDecryptMessage && belowPage === 'Withdraw' && (
        <Card>
          <CardHeader>
            <h3 className="title">Withdraw KLAY</h3>
            <Text>Withdraw as much KLAY as you want from WKLAY.</Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ rowGap: 10, marginBottom: 10 }}>
                <View>
                  <Label>WKLAY</Label>
                  <FormInput
                    type="text"
                    placeholder="Amount of WKLAY you want to withdraw"
                    value={withdrawKlayAmount}
                    onChange={setWithdrawKlayAmount}
                  />
                </View>
                <Button disabled={withdrawButtonDisabled} onClick={withdraw}>
                  Withdraw
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  contractAddress
)
wklay.options.from = ownerAddress
const receipt = await wklay.send(
  { from: ownerAddress, gas: 1000000 },
  'withdraw',
  caver.utils.toPeb(withdrawKlayAmount, 'KLAY')
)`}
              />
            </CardSection>
            {!!withdrawMsg && (
              <CardSection>
                {withdrawSuccess ? (
                  <Text>
                    {withdrawMsg} You can check it below link:
                    <br />
                    <LinkA
                      link={`${URLMAP.network['testnet']['scope']}${withdrawTxHash}`}
                    >
                      Block Explorer
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {withdrawMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {ownerDecryptMessage && belowPage === `Transfer of Owner's WKLAY` && (
        <Card>
          <CardHeader>
            <h3 className="title">Transfer of Owner's WKLAY</h3>
            <Text>Transfer the WKLAY you own to another address.</Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ rowGap: 10, marginBottom: 10 }}>
                <View>
                  <Label>Receiver Address</Label>
                  <FormInput
                    type="text"
                    placeholder="Address to get WKLAY"
                    value={transferAddress}
                    onChange={setTransferAddress}
                  />
                  <Label>WKLAY</Label>
                  <FormInput
                    type="text"
                    placeholder="Amount of WKLAY you want to transfer"
                    value={transferKlayAmount}
                    onChange={setTransferKlayAmount}
                  />
                </View>
                <Button disabled={transferButtonDisabled} onClick={transfer}>
                  Transfer
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  contractAddress
)
wklay.options.from = ownerAddress
const receipt = await wklay.send(
  { from: ownerAddress, gas: 1000000 },
  'transfer',
  transferAddress,
  caver.utils.toPeb(transferKlayAmount, 'KLAY')
)`}
              />
            </CardSection>
            {!!transferMsg && (
              <CardSection>
                {transferSuccess ? (
                  <Text>
                    {transferMsg} You can check it below link:
                    <br />
                    <LinkA
                      link={`${URLMAP.network['testnet']['scope']}${transferTxHash}`}
                    >
                      Block Explorer
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {transferMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {ownerDecryptMessage && belowPage === 'Approve' && (
        <Card>
          <CardHeader>
            <h3 className="title">Approve Using WKLAY</h3>
            <Text>Approve using WKLAY at another account address.</Text>
          </CardHeader>
          <CardBody>
            {approvedAddress ? (
              <>
                <CardSection>
                  <View style={{ rowGap: 10, marginBottom: 10 }}>
                    <View>
                      <Label>Address To Be Approved</Label>
                      <FormInput
                        type="text"
                        placeholder="Account address you want to approve"
                        value={approvedAddress}
                        onChange={(): void => {}}
                      />
                      <Label>WKLAY</Label>
                      <FormInput
                        type="text"
                        placeholder="Amount of WKLAY you want to approve"
                        value={approvedKlayAmount}
                        onChange={setApprovedKlayAmount}
                      />
                    </View>
                    <Button disabled={approvedButtonDisabled} onClick={approve}>
                      Approve
                    </Button>
                  </View>
                  <CodeBlock
                    title="caver-js code"
                    text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  contractAddress
)
wklay.options.from = ownerAddress
const receipt = await wklay.send(
  { from: ownerAddress, gas: 1000000 },
  'approve',
  approvedAddress,
  caver.utils.toPeb(approvedKlayAmount, 'KLAY')
)`}
                  />
                </CardSection>
                {!!approvedMsg && (
                  <CardSection>
                    {approvedSuccess ? (
                      <Text>
                        {approvedMsg} You can check it below link:
                        <br />
                        <LinkA
                          link={`${URLMAP.network['testnet']['scope']}${approvedTxHash}`}
                        >
                          Block Explorer
                        </LinkA>
                      </Text>
                    ) : (
                      <Text style={{ color: COLOR.error }}>
                        {' '}
                        {approvedMsg}{' '}
                      </Text>
                    )}
                  </CardSection>
                )}
              </>
            ) : (
              <CardSection>
                <Text>
                  Please upload the keystore of the account to be approved
                  first.
                </Text>
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {ownerDecryptMessage &&
        belowPage === `Transfer of Owner's WKLAY Using Approved Account` && (
          <>
            <Card>
              <CardHeader>
                <h3 className="title">Check the Allowance of WKLAY</h3>
                <Text>
                  Check the allowance of WKLAY of the approved account.
                </Text>
              </CardHeader>
              <CardBody>
                {approvedAddress ? (
                  <>
                    <CardSection>
                      <View style={{ marginBottom: 10 }}>
                        <Button
                          disabled={allowanceButtonDisabled}
                          onClick={allowance}
                        >
                          Allowance Check
                        </Button>
                      </View>
                      <CodeBlock
                        title="caver-js code"
                        text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  contractAddress
)
wklay.options.from = approvedAddress
const returnedAllowance = await wklay.call(
  'allowance',
  ownerAddress,
  approvedAddress
)`}
                      />
                    </CardSection>
                    {!!allowanceMsg && (
                      <CardSection>
                        {allowanceSuccess ? (
                          <Text>{allowanceMsg}</Text>
                        ) : (
                          <Text style={{ color: COLOR.error }}>
                            {' '}
                            {allowanceMsg}{' '}
                          </Text>
                        )}
                      </CardSection>
                    )}
                  </>
                ) : (
                  <CardSection>
                    <Text>
                      Please upload the keystore of the account to be approved
                      first.
                    </Text>
                  </CardSection>
                )}
              </CardBody>
            </Card>
            {allowanceSuccess && (
              <Card>
                <CardHeader>
                  <h3 className="title">
                    Transfer of Owner's WKLAY Using Approved Account
                  </h3>
                  <Text>Send the WKLAY allowed to use.</Text>
                </CardHeader>
                <CardBody>
                  <CardSection>
                    <View style={{ rowGap: 10, marginBottom: 10 }}>
                      <View>
                        <Label>Receiver Address</Label>
                        <FormInput
                          type="text"
                          placeholder="Address to get WKLAY"
                          value={approvedTransferAddress}
                          onChange={setApprovedTransferAddress}
                        />
                        <Label>WKLAY</Label>
                        <FormInput
                          type="text"
                          placeholder="Amount of WKLAY you want to transfer"
                          value={approvedTransferKlayAmount}
                          onChange={setApprovedTransferKlayAmount}
                        />
                      </View>
                      <Button
                        disabled={approvedTransferButtonDisabled}
                        onClick={approvedTransfer}
                      >
                        Transfer
                      </Button>
                    </View>
                    <CodeBlock
                      title="caver-js code"
                      text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  contractAddress
)
wklay.options.from = approvedAddress
const receipt = await wklay.send(
  { from: approvedAddress, gas: 1000000 },
  'transferFrom',
  ownerAddress,
  approvedTransferAddress,
  caver.utils.toPeb(approvedTransferKlayAmount, 'KLAY')
)`}
                    />
                  </CardSection>
                  {!!approvedTransferMsg && (
                    <CardSection>
                      {approvedTransferSuccess ? (
                        <Text>
                          {approvedTransferMsg} You can check it below link:
                          <br />
                          <LinkA
                            link={`${URLMAP.network['testnet']['scope']}${approvedTransferTxHash}`}
                          >
                            Block Explorer
                          </LinkA>
                        </Text>
                      ) : (
                        <Text style={{ color: COLOR.error }}>
                          {' '}
                          {approvedTransferMsg}{' '}
                        </Text>
                      )}
                    </CardSection>
                  )}
                </CardBody>
              </Card>
            )}
          </>
        )}
    </Container>
  )
}

export default WKLAY
