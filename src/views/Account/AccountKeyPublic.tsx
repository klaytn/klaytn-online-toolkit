import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, {
  EncryptedKeystoreV3Json,
  EncryptedKeystoreV4Json,
  TransactionReceipt,
} from 'caver-js'
import _ from 'lodash'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'

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
} from 'components'
import { ResultFormType } from 'types'

const AccountKeyPublic = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])
  const [params] = useSearchParams()
  const [privateKey, setPrivateKey] = useState(params.get('pkey') || '')
  const [newPrivateKey, setNewPrivateKey] = useState('')
  const [password, setPassword] = useState('')
  const [keystoreV4, setKeystoreV4] = useState<EncryptedKeystoreV4Json>()
  const [keystoreV3, setkeystoreV3] = useState<EncryptedKeystoreV3Json>()

  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [result, setResult] = useState<ResultFormType<TransactionReceipt>>()

  const generateKey = (setter: (value: string) => void): void => {
    const key = caver.wallet.keyring.generateSingleKey()
    setter(key)
  }

  const { keyring, keyringErrMsg } = useMemo(() => {
    if (privateKey) {
      try {
        return {
          keyring: caver.wallet.keyring.createFromPrivateKey(privateKey),
        }
      } catch (error) {
        return {
          keyringErrMsg: _.toString(error),
        }
      }
    }
    return {}
  }, [privateKey])

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

  const { data: accountInfo, refetch } = useQuery(
    [keyring],
    async () => {
      if (keyring) {
        const accountKey = await caver.rpc.klay.getAccountKey(keyring.address)

        if (accountKey) {
          const hexBalance = await caver.rpc.klay.getBalance(keyring.address)
          return {
            address: keyring.address,
            accountKey,
            klay_balance: caver.utils.fromPeb(hexBalance, 'KLAY'),
          }
        }
      }
    },
    {
      enabled: !!keyring,
    }
  )

  const updateKeyring = async (): Promise<void> => {
    setResult(undefined)
    try {
      if (keyring && newKeyring) {
        setIsUpdating(true)
        caver.wallet.add(keyring)
        const account = newKeyring.toAccount()
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
        refetch()
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
      setkeystoreV3(newKeyring.encryptV3(password))
    }
  }

  useEffect(() => {
    setResult(undefined)
  }, [privateKey])

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
              'You can change the private key of your account with AccountKeyPublic.\n'
            }
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeypublic">
              [Docs : AccountKeyPublic]
            </LinkA>
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <CardSection>
            <Label>Original private Key</Label>
            <View style={{ paddingBottom: 10 }}>
              <FormInput
                value={privateKey}
                onChange={setPrivateKey}
                placeholder="Input private key"
              />
              {keyringErrMsg && (
                <Text style={{ color: COLOR.error }}>{keyringErrMsg}</Text>
              )}
            </View>
            <Button onClick={(): void => generateKey(setPrivateKey)}>
              Generate a private key
            </Button>
            <CodeBlock
              title="caver-js code"
              text={`const privateKey = caver.wallet.keyring.generateSingleKey()
const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
            />
          </CardSection>
          {keyring && (
            <CardSection>
              <Label>Keyring from original private key</Label>
              <View style={{ paddingBottom: 10 }}>
                <CodeBlock
                  text={JSON.stringify(keyring, null, 2)}
                  toggle={false}
                />
                <CodeBlock
                  title="caver-js code"
                  text={`const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
                />
              </View>

              <LinkA link="https://baobab.wallet.klaytn.foundation/faucet">
                <Row style={{ gap: 4, alignItems: 'center' }}>
                  <Text style={{ color: COLOR.primary }}>
                    1. Get some testnet KLAY
                  </Text>
                  <Button
                    size="sm"
                    onClick={(): void => {
                      refetch()
                    }}
                  >
                    Move to get KLAY
                  </Button>
                </Row>
              </LinkA>
              <Row style={{ gap: 4, alignItems: 'center' }}>
                <Text>Address : </Text>
                <View style={{ flex: 1 }}>
                  <CodeBlock text={keyring.address} toggle={false} />
                </View>
              </Row>
              <Row style={{ gap: 4, alignItems: 'center' }}>
                <Text style={{ color: COLOR.primary }}>
                  2. After getting testnet KLAY, you can retrieve your account
                  info from Baobab network.
                </Text>
                <Button
                  size="sm"
                  onClick={(): void => {
                    refetch()
                  }}
                >
                  Refetch account info
                </Button>
              </Row>
            </CardSection>
          )}
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
                      onClick={(): void => generateKey(setNewPrivateKey)}
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
                        onClick={updateKeyring}
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
