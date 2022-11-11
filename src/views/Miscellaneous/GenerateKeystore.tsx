import React, { ReactElement, useMemo, useEffect, useState } from 'react'
import Caver, { Keystore } from 'caver-js'
import _ from 'lodash'

import {
  Row,
  Container,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  Label,
  FormInput,
  CardSection,
  FormRadio,
  LinkA,
  View,
} from 'components'
import { ResultFormType } from 'types'
import KeystoreResultForm from './components/KeystoreResultForm'

type SingleType = {
  singleProps: {
    setPrivateKey: React.Dispatch<React.SetStateAction<string>>
    privateKey: string
    setAddress: React.Dispatch<React.SetStateAction<string>>
    caver: Caver
  }
}

const SingleKey = ({ singleProps }: SingleType): ReactElement => {
  const { setPrivateKey, privateKey, setAddress, caver } = singleProps

  const generateSingleKey = (): void => {
    const singleKey = caver.wallet.keyring.generateSingleKey()
    setPrivateKey(singleKey)

    const singleKeyring = caver.wallet.keyring.createFromPrivateKey(singleKey)
    setAddress(singleKeyring.address)
  }

  return (
    <CardSection>
      <Label>Private Key</Label>
      <View style={{ paddingBottom: 10 }}>
        <FormInput
          type="text"
          placeholder="Private Key"
          onChange={setPrivateKey}
          value={privateKey}
        />
      </View>
      <Button onClick={generateSingleKey}>Generate Key</Button>
    </CardSection>
  )
}

type MultiType = {
  multiProps: {
    privateKeys: Array<string>
    setPrivateKeys: React.Dispatch<React.SetStateAction<Array<string>>>
    caver: Caver
  }
}

const MultipleKey = ({ multiProps }: MultiType): ReactElement => {
  const { privateKeys, setPrivateKeys, caver } = multiProps
  const [numOfPrivateKeys, setNumOfPrivateKeys] = useState<number>(2)

  const handleNumberChange = (val: number): void => {
    setNumOfPrivateKeys(val)
    setPrivateKeys(new Array<string>(val).fill(''))
  }

  const handleInputChange = (val: string, idx: number): void => {
    privateKeys[idx] = val
    setPrivateKeys([...privateKeys])
  }

  const generateMultipleKeys = (): void => {
    const multipleKeys = caver.wallet.keyring.generateMultipleKeys(
      Number(numOfPrivateKeys)
    )
    setPrivateKeys(multipleKeys)
  }

  useEffect(() => {
    setPrivateKeys(['', ''])
  }, [])

  return (
    <CardSection>
      <Label>Number of Private Keys</Label>
      <View style={{ paddingBottom: 10 }}>
        <FormRadio
          itemList={[
            { title: '2', value: 2 },
            { title: '3', value: 3 },
            { title: '4', value: 4 },
            { title: '5', value: 5 },
          ]}
          selectedValue={numOfPrivateKeys}
          onClick={handleNumberChange}
        />
      </View>
      <View style={{ paddingBottom: 10 }}>
        {!!numOfPrivateKeys && (
          <>
            <Label>Private Keys</Label>
            {privateKeys.map((key, idx) => {
              return (
                <View style={{ paddingBottom: 10 }}>
                  <FormInput
                    key={`multiple-privateKey-${idx}`}
                    type="text"
                    placeholder="Private Key"
                    onChange={(v): void => {
                      handleInputChange(v, idx)
                    }}
                    value={key}
                  />
                </View>
              )
            })}
          </>
        )}
        {!!numOfPrivateKeys && (
          <Button onClick={generateMultipleKeys}>Generate All Keys</Button>
        )}
      </View>
    </CardSection>
  )
}

type RoleBasedType = {
  roleBasedProps: {
    rolePrivateKeys: Array<Array<string>>
    setRolePrivateKeys: React.Dispatch<
      React.SetStateAction<Array<Array<string>>>
    >
    caver: Caver
  }
}

const RoleBasedKey = ({ roleBasedProps }: RoleBasedType): ReactElement => {
  const { rolePrivateKeys, setRolePrivateKeys, caver } = roleBasedProps
  const [numOfRolePrivateKeys, setNumberOfRolePrivateKeys] = useState<
    Array<number>
  >([2, 2, 2])
  const types = [
    'roleTransactionKey',
    'roleAccountUpdateKey',
    'roleFeePayerKey',
  ]

  const handleNumberChange = (val: number, idx: number): void => {
    numOfRolePrivateKeys[idx] = val
    rolePrivateKeys[idx] = new Array<string>(val).fill('')
    setNumberOfRolePrivateKeys([...numOfRolePrivateKeys])
    setRolePrivateKeys([...rolePrivateKeys])
  }

  const handleInputChange = (
    val: string,
    roleIdx: number,
    keyIdx: number
  ): void => {
    rolePrivateKeys[roleIdx][keyIdx] = val
    setRolePrivateKeys([...rolePrivateKeys])
  }

  const generateRoleBasedKeys = (): void => {
    let keys = new Array<number>(3)
    for (let i = 0; i < 3; i++) {
      keys[i] = Number(numOfRolePrivateKeys[i])
    }
    const roleBasedKeys = caver.wallet.keyring.generateRoleBasedKeys(keys)
    setRolePrivateKeys(roleBasedKeys)
  }

  useEffect(() => {
    setRolePrivateKeys([
      ['', ''],
      ['', ''],
      ['', ''],
    ])
  }, [])

  return (
    <CardSection>
      <Row style={{ columnGap: 8, justifyContent: 'space-around' }}>
        {numOfRolePrivateKeys.map((val, idx) => {
          return (
            <View key={`column-${idx}`} style={{ width: '32%' }}>
              <Label>{`Number of ${types[idx]}s`}</Label>
              <View style={{ paddingBottom: 10 }}>
                <FormRadio
                  itemList={[
                    { title: '1', value: 1 },
                    { title: '2', value: 2 },
                    { title: '3', value: 3 },
                  ]}
                  selectedValue={val}
                  onClick={(v): void => {
                    handleNumberChange(v, idx)
                  }}
                />
              </View>
              {!!numOfRolePrivateKeys[idx] && (
                <>
                  <Label>Private Keys</Label>
                  {rolePrivateKeys[idx].map((key, i) => {
                    return (
                      <View style={{ paddingBottom: 10 }}>
                        <FormInput
                          key={`rolebased-privateKey-${types[idx]}-${i}`}
                          type="text"
                          placeholder="Private Key"
                          onChange={(v): void => {
                            handleInputChange(v, idx, i)
                          }}
                          value={key}
                        />
                      </View>
                    )
                  })}
                </>
              )}
            </View>
          )
        })}
      </Row>
      {!!numOfRolePrivateKeys[0] ||
      !!numOfRolePrivateKeys[1] ||
      !!numOfRolePrivateKeys[2] ? (
        <Button onClick={generateRoleBasedKeys}>Generate All Keys</Button>
      ) : (
        <Text>Please click the number of private keys.</Text>
      )}
    </CardSection>
  )
}

enum AccountKeyTypeEnum {
  SINGLE = 'Single',
  MULTIPLE = 'Multiple',
  ROLEBASED = 'Role-Based',
}

const GenerateKeystore = (): ReactElement => {
  const [accountKeyType, setAccountKeyType] = useState<AccountKeyTypeEnum>(
    AccountKeyTypeEnum.SINGLE
  )
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [privateKeys, setPrivateKeys] = useState<Array<string>>([])
  const [rolePrivateKeys, setRolePrivateKeys] = useState<Array<Array<string>>>([
    [],
    [],
    [],
  ])
  const [keystoreShown, setKeystoreShown] = useState(false)
  const [result, setResult] = useState<ResultFormType<Keystore>>()

  const caver = useMemo(() => new Caver(), [])

  const changeAccountKeyType = (val: AccountKeyTypeEnum): void => {
    setAccountKeyType(val)
    setPassword('')
    setAddress('')
    setPrivateKey('')
    setPrivateKeys(['', ''])
    setRolePrivateKeys([
      ['', ''],
      ['', ''],
      ['', ''],
    ])
    setKeystoreShown(false)
  }

  const generateKeystoreV3 = (): void => {
    try {
      const keyring = caver.wallet.keyring.create(address, privateKey)
      setResult({
        success: true,
        value: keyring.encryptV3(password),
      })
    } catch (e) {
      setResult({
        success: false,
        message: _.toString(e),
      })
    } finally {
      setKeystoreShown(true)
    }
  }

  const generateKeystoreV4 = (): void => {
    try {
      let keyring
      if (accountKeyType === AccountKeyTypeEnum.SINGLE) {
        keyring = caver.wallet.keyring.create(address, privateKey)
      } else if (accountKeyType === AccountKeyTypeEnum.MULTIPLE) {
        keyring = caver.wallet.keyring.create(address, privateKeys)
      } else if (accountKeyType === AccountKeyTypeEnum.ROLEBASED) {
        keyring = caver.wallet.keyring.create(address, rolePrivateKeys)
      }

      setResult({
        success: true,
        value: keyring?.encrypt(password),
      })
    } catch (e) {
      setResult({
        success: false,
        message: _.toString(e),
      })
    } finally {
      setKeystoreShown(true)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Generate Keystore</h3>
          <Text>
            Generate Private Key(s), encrypt a keyring, and return a keystore.
            Since Klaytn provides various account key types such as
            multi-signature and role-based keys, Klaytn introduces keystore
            format v4 which is suitable to store multiple private keys. Single
            Keyring keystore file can be generated in both v3 and v4 format,
            while other keyring types are encrypted in v4 format. <br />
            For more details, please visit here:{' '}
            <LinkA link="https://kips.klaytn.foundation/KIPs/kip-3">
              [KIP 3: Klaytn Keystore Format v4]
            </LinkA>
          </Text>
          <Text style={{ color: 'red', fontWeight: 600, fontSize: 15 }}>
            NOTE: CREATING A KEYSTORE DOES NOT UPDATE YOUR ACCOUNT!
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Account Key Type</Label>
            <FormRadio
              itemList={[
                { title: 'Single', value: AccountKeyTypeEnum.SINGLE },
                { title: 'Multiple', value: AccountKeyTypeEnum.MULTIPLE },
                { title: 'Role-Based', value: AccountKeyTypeEnum.ROLEBASED },
              ]}
              selectedValue={accountKeyType}
              onClick={(v): void => {
                changeAccountKeyType(v)
              }}
            />
          </CardSection>
          {accountKeyType === AccountKeyTypeEnum.SINGLE && (
            <SingleKey
              singleProps={{
                setPrivateKey,
                privateKey,
                setAddress,
                caver,
              }}
            />
          )}
          {accountKeyType === AccountKeyTypeEnum.MULTIPLE && (
            <MultipleKey multiProps={{ privateKeys, setPrivateKeys, caver }} />
          )}
          {accountKeyType === AccountKeyTypeEnum.ROLEBASED && (
            <RoleBasedKey
              roleBasedProps={{ rolePrivateKeys, setRolePrivateKeys, caver }}
            />
          )}
          <CardSection>
            <Label>Address</Label>
            <View style={{ paddingBottom: 10 }}>
              <FormInput
                type="text"
                placeholder="Address"
                onChange={setAddress}
                value={address}
              />
            </View>
            <Label>Password</Label>
            <View style={{ paddingBottom: 10 }}>
              <FormInput
                type="password"
                placeholder="Password"
                onChange={setPassword}
                value={password}
              />
            </View>
            <Row style={{ columnGap: 8 }}>
              {accountKeyType === AccountKeyTypeEnum.SINGLE && (
                <Button onClick={generateKeystoreV3}>
                  Generate Keystore (v3)
                </Button>
              )}
              <Button onClick={generateKeystoreV4}>
                Generate Keystore (v4)
              </Button>
            </Row>
          </CardSection>
          {keystoreShown && (
            <>
              <KeystoreResultForm title={'Keystore'} result={result} />
            </>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default GenerateKeystore
