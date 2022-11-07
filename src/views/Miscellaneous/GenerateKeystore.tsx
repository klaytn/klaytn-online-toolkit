import React, { ReactElement, useMemo, useState } from 'react'
import Caver, { Keystore } from 'caver-js'
import _ from 'lodash'

import {
  Row,
  Column,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  ButtonGroup,
  Label,
  FormInput,
  ResultForm,
  CardSection,
  FormRadio,
} from 'components'
import { ResultFormType } from 'types'

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

  const generateSingleKey = () => {
    const singleKey = caver.wallet.keyring.generateSingleKey()
    setPrivateKey(singleKey)

    const singleKeyring = caver.wallet.keyring.createFromPrivateKey(singleKey)
    setAddress(singleKeyring.address)
  }

  return (
    <CardSection>
      <Label>Private Key</Label>
      <FormInput
        type="text"
        placeholder="Private Key"
        onChange={setPrivateKey}
        value={privateKey}
      />
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
  const [numOfPrivateKeys, setNumOfPrivateKeys] = useState<number | string>('')

  const handleNumberChange = (val: string) => {
    if (Number(val) <= 0 || Number(val) >= 100 || val === '') {
      setNumOfPrivateKeys('')
    } else {
      setNumOfPrivateKeys(Number(val))
      setPrivateKeys(new Array<string>(Number(val)).fill(''))
    }
  }

  const handleInputChange = (val: string, idx: number) => {
    privateKeys[idx] = val
    setPrivateKeys([...privateKeys])
  }

  const generateMultipleKeys = () => {
    const multipleKeys = caver.wallet.keyring.generateMultipleKeys(
      Number(numOfPrivateKeys)
    )
    setPrivateKeys(multipleKeys)
  }

  return (
    <CardSection>
      <Label>Number of Private Keys</Label>
      <FormInput
        type="number"
        placeholder="Number of Private Keys (<100)"
        onChange={handleNumberChange}
        value={numOfPrivateKeys}
      />
      {!numOfPrivateKeys && (
        <Text>
          <br />
          Please fill in the number of private keys. The number of private keys
          must be a positive integer.
          <br />
          NOTE: CREATING A KEYSTORE DOES NOT UPDATE YOUR ACCOUNT.
        </Text>
      )}
      {!!numOfPrivateKeys && <Label>Private Keys</Label>}
      {!!numOfPrivateKeys &&
        privateKeys.map((key, idx) => {
          return (
            <FormInput
              key={`${key}${idx}`}
              type="text"
              placeholder="Private Key"
              onChange={(v) => {
                handleInputChange(v, idx)
              }}
              value={key}
              style={{ marginTop: '5px' }}
            />
          )
        })}
      {!!numOfPrivateKeys && (
        <Button onClick={generateMultipleKeys}>Generate All Keys</Button>
      )}
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
    Array<number | string>
  >(['', '', ''])
  const types = [
    'roleTransactionKey',
    'roleAccountUpdateKey',
    'roleFeePayerKey',
  ]

  const handleNumberChange = (val: string, idx: number) => {
    if (Number(val) <= 0 || Number(val) >= 100 || val === '') {
      numOfRolePrivateKeys[idx] = ''
      setNumberOfRolePrivateKeys([...numOfRolePrivateKeys])
      rolePrivateKeys[idx] = ['']
    } else {
      numOfRolePrivateKeys[idx] = Number(val)
      setNumberOfRolePrivateKeys([...numOfRolePrivateKeys])
      rolePrivateKeys[idx] = new Array<string>(Number(val)).fill('')
      setRolePrivateKeys([...rolePrivateKeys])
    }
  }

  const handleInputChange = (val: string, roleIdx: number, keyIdx: number) => {
    rolePrivateKeys[roleIdx][keyIdx] = val
    setRolePrivateKeys([...rolePrivateKeys])
  }

  const generateRoleBasedKeys = () => {
    let keys = new Array<number>(3)
    for (let i = 0; i < 3; i++) {
      keys[i] = Number(numOfRolePrivateKeys[i])
    }
    const roleBasedKeys = caver.wallet.keyring.generateRoleBasedKeys(keys)
    setRolePrivateKeys(roleBasedKeys)
  }

  return (
    <CardSection>
      <Row>
        {numOfRolePrivateKeys.map((val, idx) => {
          return (
            <Column key={idx}>
              <Label>{types[idx]}</Label>
              <FormInput
                type="number"
                placeholder={`Number of ${types[idx]}s (<100)`}
                onChange={(v) => {
                  handleNumberChange(v, idx)
                }}
                value={val}
                style={{ width: '100%' }}
              />
              {!!numOfRolePrivateKeys[idx] && <Label>Private Keys</Label>}
              {!!numOfRolePrivateKeys[idx] &&
                rolePrivateKeys[idx].map((key, i) => {
                  return (
                    <FormInput
                      key={`${key}${i}`}
                      type="text"
                      placeholder="Private Key"
                      onChange={(v) => {
                        handleInputChange(v, idx, i)
                      }}
                      value={key}
                      style={{ marginTop: '5px', width: '100%' }}
                    />
                  )
                })}
            </Column>
          )
        })}
      </Row>
      {!!numOfRolePrivateKeys[0] ||
      !!numOfRolePrivateKeys[1] ||
      !!numOfRolePrivateKeys[2] ? (
        <Button onClick={generateRoleBasedKeys}>Generate All Keys</Button>
      ) : (
        <Text>
          <br />
          Please fill in the number of private keys. The number of private keys
          must be a positive integer.
          <br />
          NOTE: CREATING A KEYSTORE DOES NOT UPDATE YOUR ACCOUNT.
        </Text>
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
  const [privateKeys, setPrivateKeys] = useState<Array<string>>([''])
  const [rolePrivateKeys, setRolePrivateKeys] = useState<Array<Array<string>>>([
    [''],
    [''],
    [''],
  ])
  const [keystoreShown, setKeystoreShown] = useState(false)
  const [result, setResult] = useState<ResultFormType<Keystore>>()

  const caver = useMemo(() => new Caver(), [])

  const changeAccountKeyType = (val: AccountKeyTypeEnum) => {
    setAccountKeyType(val)
    setAddress('')
    setPassword('')
    setPrivateKey('')
    setKeystoreShown(false)
  }

  const generateKeystoreV3 = () => {
    try {
      const keyring = caver.wallet.keyring.create(address, privateKey)
      setResult({
        success: true,
        value: keyring.encryptV3(password),
      })
      setKeystoreShown(true)
    } catch (e) {
      setResult({
        success: false,
        message: _.toString(e),
      })
      setKeystoreShown(true)
    }
  }

  const generateKeystoreV4 = () => {
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
      setKeystoreShown(true)
    } catch (e) {
      setResult({
        success: false,
        message: _.toString(e),
      })
      setKeystoreShown(true)
    }
  }

  const downloadFile = () => {
    if (result?.success === true) {
      const date = new Date()
      const filename = `keystore-${address}-${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}.json`
      let element = document.createElement('a')

      const ks = JSON.stringify(result.value)
      element.setAttribute(
        'href',
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ks))
      )
      element.setAttribute('download', filename)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Generate Keystore</h3>
          <FormRadio
            itemList={[
              { title: 'Single', value: AccountKeyTypeEnum.SINGLE },
              { title: 'Multiple', value: AccountKeyTypeEnum.MULTIPLE },
              { title: 'Role-Based', value: AccountKeyTypeEnum.ROLEBASED },
            ]}
            selectedValue={accountKeyType}
            onClick={(v) => {
              changeAccountKeyType(v)
              setAccountKeyType(v)
            }}
          />
          <Text>
            Generate Private Key(s), encrypt a keyring, and return a keystore.
            Since Klaytn provides various account key types such as
            multi-signature and role-based keys, Klaytn introduces keystore
            format v4 which is suitable to store multiple private keys. Single
            Keyring keystore file can be generated in both v3 and v4 format,
            while other keyring types are encrypted in v4 format. <br />
            For more details, please visit here:{' '}
            <a href="https://kips.klaytn.foundation/KIPs/kip-3">
              [KIP 3: Klaytn Keystore Format v4]
            </a>
            .{' '}
          </Text>
        </CardHeader>
        <CardBody>
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
            <FormInput
              type="text"
              placeholder="Address"
              onChange={setAddress}
              value={address}
            />
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setPassword}
              value={password}
            />
            <ButtonGroup>
              {accountKeyType === AccountKeyTypeEnum.SINGLE && (
                <Button onClick={generateKeystoreV3}>
                  Generate Keystore(v3)
                </Button>
              )}
              <Button onClick={generateKeystoreV4}>
                Generate Keystore(v4)
              </Button>
            </ButtonGroup>
          </CardSection>
          {keystoreShown && (
            <CardSection>
              <ResultForm title={'Keystore'} result={result} />
              {result?.success && (
                <Button onClick={downloadFile}>Download</Button>
              )}
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default GenerateKeystore
