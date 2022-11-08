import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, {
  EncryptedKeystoreV3Json,
  EncryptedKeystoreV4Json,
  Keyring,
  TransactionReceipt,
} from 'caver-js'
import _ from 'lodash'

import { COLOR, URLMAP, UTIL } from 'consts'

import {
  Column,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  View,
  Label,
  FormInput,
  CodeBlock,
  Row,
  LinkA,
  ResultForm,
  CardSection,
  Loading,
  FormDownload,
  PrivateKeyWarning,
} from 'components'
import { ResultFormType } from 'types'
import useAccounts from 'hooks/account/useAccounts'
import GetKeySection from './components/GetKeySection'
import { generateSingleKey } from 'logics/caverFuncntions'

const AccountKeyPublic = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])
  const [keyring, setKeyring] = useState<Keyring>()
  const useAccountsReturn = useAccounts({
    caver,
    keyring,
  })

  const [newPrivateKey, setNewPrivateKey] = useState('')
  const { accountInfo, refetchAccountInfo } = useAccountsReturn

  const [password, setPassword] = useState('')
  const [keystoreV4, setKeystoreV4] = useState<EncryptedKeystoreV4Json>()
  const [keystoreV3, setkeystoreV3] = useState<EncryptedKeystoreV3Json>()

  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [result, setResult] = useState<ResultFormType<TransactionReceipt>>()

  const { newKeyring, newKeyringErrMsg } = useMemo(() => {
    if (keyring && newPrivateKey) {
      try {
        return {
          newKeyring: caver.wallet.keyring.create(
            keyring.address,
            newPrivateKey
          ),
        }
      } catch (error) {
        return {
          newKeyringErrMsg: _.toString(error),
        }
      }
    }
    return {}
  }, [keyring, newPrivateKey])

  const updateAccount = async (): Promise<void> => {
    setResult(undefined)
    try {
      if (keyring && newKeyring) {
        setIsUpdating(true)
        caver.wallet.add(keyring)
        const account = newKeyring.toAccount()
        account.address = keyring.address
        const accountUpdate = caver.transaction.accountUpdate.create({
          from: keyring.address,
          account,
          gas: 100000,
        })

        await caver.wallet.sign(keyring.address, accountUpdate)
        const receipt = await caver.rpc.klay.sendRawTransaction(accountUpdate)

        caver.wallet.remove(keyring.address)
        setResult({
          success: true,
          value: receipt,
        })
        refetchAccountInfo()
        setIsUpdated(true)
      }
    } catch (error) {
      setResult({
        success: false,
        message: _.toString(error),
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const generateKeystores = (): void => {
    if (newKeyring) {
      setKeystoreV4(newKeyring.encrypt(password))
      'encryptV3' in newKeyring && setkeystoreV3(newKeyring.encryptV3(password))
    }
  }

  useEffect(() => {
    setResult(undefined)
  }, [keyring])

  useEffect(() => {
    setKeystoreV4(undefined)
    setkeystoreV3(undefined)
  }, [password])

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Change Private Key (AccountKeyPublic)</h3>
          <Text>
            {
              'You can update the private key of your account to AccountKeyPublic.\n'
            }
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeypublic">
              [Docs : AccountKeyPublic]
            </LinkA>
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <GetKeySection
            keyring={keyring}
            setKeyring={setKeyring}
            useAccountsReturn={useAccountsReturn}
          />
          {accountInfo && (
            <>
              <CardSection>
                <Label>
                  Account info of on-chain{' '}
                  {isUpdated && <b style={{ color: 'white' }}>UPDATED !!</b>}
                </Label>
                <View style={{ paddingBottom: 10 }}>
                  <CodeBlock
                    text={JSON.stringify(accountInfo, null, 2)}
                    toggle={false}
                  />
                  <CodeBlock
                    title="caver-js code"
                    text={`const accountKey = await caver.rpc.klay.getAccountKey(keyring.address)
const hexBalance = await caver.rpc.klay.getBalance(keyring.address)
return {
  address: keyring.address,
  accountKey,
  klay_balance: caver.utils.fromPeb(hexBalance, 'KLAY'),
}`}
                  />
                </View>
              </CardSection>
              {UTIL.toBn(accountInfo.klay_balance).gt(0) && (
                <CardSection>
                  <Label>New private key</Label>
                  <View style={{ paddingBottom: 10 }}>
                    <FormInput
                      value={newPrivateKey}
                      onChange={setNewPrivateKey}
                      placeholder="Input new private Key"
                      readonly={isUpdated}
                    />
                    {newKeyringErrMsg && (
                      <Text style={{ color: COLOR.error }}>
                        {newKeyringErrMsg}
                      </Text>
                    )}
                  </View>
                  {false === isUpdated && (
                    <Button
                      onClick={(): void =>
                        setNewPrivateKey(generateSingleKey())
                      }
                      disabled={isUpdating}
                    >
                      Generate a private key for new
                    </Button>
                  )}
                </CardSection>
              )}
              {newKeyring && (
                <>
                  <CardSection>
                    <Label>
                      New keyring (original address + new private key)
                    </Label>
                    <View style={{ paddingBottom: 10 }}>
                      <CodeBlock
                        text={JSON.stringify(newKeyring, null, 2)}
                        toggle={false}
                      />
                    </View>
                    {false === isUpdated && (
                      <Button
                        onClick={updateAccount}
                        disabled={isUpdating || !newPrivateKey}
                      >
                        {isUpdating ? (
                          <Loading size={16} />
                        ) : (
                          'Update new keyring on chain'
                        )}
                      </Button>
                    )}
                    <CodeBlock
                      title="caver-js code"
                      text={`caver.wallet.add(keyring)
const account = newKeyring.toAccount()
const accountUpdate = caver.transaction.accountUpdate.create({
  from: keyring.address,
  account,
  gas: 100000,
})
await caver.wallet.sign(keyring.address, accountUpdate)
const receipt = await caver.rpc.klay.sendRawTransaction(accountUpdate)
caver.wallet.remove(keyring.address)`}
                    />
                  </CardSection>
                  {isUpdated && (
                    <CardSection>
                      <Label>Enter the password for the keystore file</Label>
                      <View style={{ paddingBottom: 10 }}>
                        <FormInput
                          type="password"
                          value={password}
                          onChange={setPassword}
                          placeholder="Input password"
                        />
                      </View>
                      <Row style={{ gap: 4 }}>
                        <Button onClick={generateKeystores}>
                          generate keystore file
                        </Button>
                        {keystoreV4 && (
                          <FormDownload
                            title="Keystore V4"
                            fileData={JSON.stringify(keystoreV4, null, 2)}
                            fileName={`keystoreV4-${newKeyring.address}`}
                          />
                        )}
                        {keystoreV3 && (
                          <FormDownload
                            title="Keystore V3"
                            fileData={JSON.stringify(keystoreV3, null, 2)}
                            fileName={`keystoreV3-${newKeyring.address}`}
                          />
                        )}
                      </Row>
                    </CardSection>
                  )}
                </>
              )}
            </>
          )}

          <ResultForm title={'Recipt of transaction'} result={result} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default AccountKeyPublic
