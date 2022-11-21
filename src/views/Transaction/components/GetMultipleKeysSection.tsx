import { ReactElement, useEffect, useState } from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { Keyring, Keystore, MultipleKeyring, SingleKeyring } from 'caver-js'

import { COLOR, UTIL } from 'consts'
import {
  Text,
  Button,
  View,
  FormInput,
  CodeBlock,
  Row,
  FormFile,
  FormSelect,
  CardSection,
  Label,
} from 'components'
import { createFromPrivateKey, keyringDecrypt } from 'logics/caverFuncntions'

export type GetKeyFrom = 'privateKey' | 'keystore'

export type KeystoreType = {
  privateKeys: string[]
  filename: string
  keyring: Keyring
}

const StyledContainer = styled(View)`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px;
  padding-bottom: 10px;
`

const GetMultipleKeysSection = ({
  keyList,
  setKeyList,
}: {
  keyList: KeystoreType[]
  setKeyList: (value: KeystoreType[]) => void
}): ReactElement => {
  const [getKeyFrom, setGetKeyFrom] = useState<GetKeyFrom>('privateKey')
  const [privateKey, setPrivateKey] = useState('')
  const [keyringErrMsg, setKeyringErrMsg] = useState('')
  const [keystoreJSON, setKeystoreJSON] = useState<Keystore>()
  const [keystorePassword, setKeystorePassword] = useState('')
  const [keystoreFileName, setKeystoreFileName] = useState('')

  const handleKeystoreChange = (files?: FileList): void => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event): void => {
        try {
          if (typeof event.target?.result === 'string') {
            const json = UTIL.jsonTryParse<Keystore>(event.target.result)
            if (!!json) {
              setKeystoreFileName(files[0].name)
              setKeystoreJSON(json)
            } else {
              throw Error(
                'Failed to parse json file. Please check keystore file again.'
              )
            }
          }
        } catch (err) {
          setKeyringErrMsg(_.toString(err))
        }
      }
    }
  }

  const onClickDecryptKeystore = (): void => {
    try {
      if (!!keystoreJSON) {
        const keyring = keyringDecrypt(keystoreJSON, keystorePassword)
        const privKeyList: string[] = []
        if (keyring.type === 'SingleKeyring') {
          privKeyList.push((keyring as SingleKeyring).key.privateKey)
        } else if (keyring.type === 'MultipleKeyring') {
          for (const element of (keyring as MultipleKeyring).keys) {
            privKeyList.push(element.privateKey)
          }
        } else if (keyring.type === 'RoleBasedKeyring') {
          const txRoleKeys = keyring.getKeyByRole(0)
          for (const element of txRoleKeys) {
            privKeyList.push(element.privateKey)
          }
        }
        setKeyList([
          ...keyList,
          {
            privateKeys: privKeyList,
            filename: keystoreFileName,
            keyring: keyring,
          },
        ])
      } else {
        throw Error('Keystore is not uploaded!')
      }
    } catch (error) {
      setKeyringErrMsg(_.toString(error))
    }
  }

  const handleKeystoreRemove = (index: number): void => {
    const privKeyList = [...keyList]
    privKeyList.splice(index, 1)
    setKeyList(privKeyList)
  }

  useEffect(() => {
    if (getKeyFrom === 'privateKey' && privateKey) {
      try {
        const keyring = createFromPrivateKey(privateKey)
        setKeyList([
          ...keyList,
          {
            privateKeys: [keyring.key.privateKey],
            filename: 'Keyring From PrivateKey',
            keyring,
          },
        ])
        setKeyringErrMsg('')
      } catch (error) {
        setKeyringErrMsg(_.toString(error))
      }
    } else if (getKeyFrom === 'keystore' && keystoreJSON && keystoreFileName) {
      try {
        const keyring = keyringDecrypt(keystoreJSON, '')
        const privKeyList: string[] = []
        if (keyring.type === 'SingleKeyring') {
          privKeyList.push((keyring as SingleKeyring).key.privateKey)
        } else if (keyring.type === 'MultipleKeyring') {
          for (const element of (keyring as MultipleKeyring).keys) {
            privKeyList.push(element.privateKey)
          }
        } else if (keyring.type === 'RoleBasedKeyring') {
          const txRoleKeys = keyring.getKeyByRole(0)
          for (const element of txRoleKeys) {
            privKeyList.push(element.privateKey)
          }
        }
        setKeyList([
          ...keyList,
          {
            privateKeys: privKeyList,
            filename: keystoreFileName,
            keyring,
          },
        ])

        //if succeeds, set keystoreJson to undefined.
        setKeystoreJSON(undefined)
      } catch {
        // just try decrypt
      }
    }
  }, [privateKey, keystoreJSON])

  useEffect(() => {
    setKeystorePassword('')
    setKeyringErrMsg('')
  }, [keystoreJSON])

  return (
    <>
      <CardSection>
        <Label>Upload Keystore file or Private Key </Label>
        <StyledContainer>
          <FormSelect
            itemList={[
              { label: 'Private Key', value: 'privateKey' },
              { label: 'Keystore', value: 'keystore' },
            ]}
            defaultValue={getKeyFrom}
            onChange={setGetKeyFrom}
            containerStyle={{ width: '100%' }}
          />
          {getKeyFrom === 'privateKey' ? (
            <View>
              <Row style={{ paddingBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <FormInput
                    value={privateKey}
                    onChange={setPrivateKey}
                    placeholder="Input private key"
                  />
                  {keyringErrMsg && (
                    <Text style={{ color: COLOR.error }}>{keyringErrMsg}</Text>
                  )}
                </View>
              </Row>
              <CodeBlock
                title="caver-js code"
                text={`const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
              />
            </View>
          ) : (
            <View>
              <View style={{ paddingBottom: 10 }}>
                <FormFile
                  placeholder="Keystore File"
                  accept=".json"
                  onChange={handleKeystoreChange}
                />
              </View>
              {keystoreJSON && (
                <View style={{ paddingBottom: 10 }}>
                  <Row style={{ gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <FormInput
                        type="password"
                        value={keystorePassword}
                        onChange={setKeystorePassword}
                        placeholder="Input password"
                      />
                    </View>
                    <Button
                      disabled={!keystorePassword}
                      onClick={onClickDecryptKeystore}
                    >
                      Decrypt
                    </Button>
                  </Row>
                  {keystorePassword && keyringErrMsg && (
                    <Text style={{ color: COLOR.error }}>{keyringErrMsg}</Text>
                  )}
                </View>
              )}
              <CodeBlock
                title="caver-js code"
                text={`const keyring = caver.wallet.keyring.decrypt(keystoreJSON, keystorePassword)`}
              />
            </View>
          )}
        </StyledContainer>
        <Label>Decrypted Keystore List </Label>
        <View style={{ rowGap: 10 }}>
          {keyList.length > 0 ? (
            keyList.map((_, index: number) => (
              <>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ justifyContent: 'center' }}>
                    <Text>{keyList[index].filename}</Text>
                  </View>
                  <Button onClick={(): void => handleKeystoreRemove(index)}>
                    Remove
                  </Button>
                </Row>
              </>
            ))
          ) : (
            <Text style={{ color: COLOR.error }}>
              There's no keystore uploaded.
            </Text>
          )}
        </View>
      </CardSection>
    </>
  )
}

export default GetMultipleKeysSection
