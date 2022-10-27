import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, {
  EncryptedKeystoreV3Json,
  EncryptedKeystoreV4Json,
} from 'caver-js'
import _ from 'lodash'

import { COLOR, URLMAP } from 'consts'

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
  FormDownload,
  CardSection,
  FormRadio,
} from 'components'

const CreateKeystore = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])
  const [privateKey, setPrivateKey] = useState('')
  const [password, setPassword] = useState('')
  const [selectedKeystoreVer, setSelectedKeystoreVer] = useState<'4' | '3'>('4')
  const [keystoreV4, setKeystoreV4] = useState<EncryptedKeystoreV4Json>()
  const [keystoreV3, setkeystoreV3] = useState<EncryptedKeystoreV3Json>()

  const generateKey = (): void => {
    const key = caver.wallet.keyring.generateSingleKey()
    setPrivateKey(key)
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

  const generateKeystores = (): void => {
    if (keyring) {
      setKeystoreV4(keyring.encrypt(password))
      setkeystoreV3(keyring.encryptV3(password))
    }
  }

  useEffect(() => {
    setKeystoreV4(undefined)
    setkeystoreV3(undefined)
  }, [password])

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Keystore</h3>
          <Text>
            Generate private key, encrypt a keyring, and return a keystore.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Private Key</Label>
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
            <Button onClick={generateKey}>Generate a private key</Button>
            <CodeBlock
              title="caver-js code"
              text={`const key = caver.wallet.keyring.generateSingleKey()`}
            />
          </CardSection>
          {keyring && (
            <>
              <CardSection>
                <Label>Keyring from the private key</Label>
                <View style={{ paddingBottom: 10 }}>
                  <CodeBlock
                    text={JSON.stringify(keyring, null, 2)}
                    toggle={false}
                  />
                </View>
                <CodeBlock
                  title="caver-js code"
                  text={`const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
                />
              </CardSection>
              <CardSection>
                <Label>Enter the password for the keystore file</Label>
                <View style={{ paddingBottom: 10 }}>
                  <FormInput
                    value={password}
                    onChange={setPassword}
                    placeholder="Input password"
                  />
                </View>
                <Button onClick={generateKeystores}>
                  generate keystore file
                </Button>
              </CardSection>
              {(keystoreV4 || keystoreV3) && (
                <CardSection>
                  <Label>Keystore</Label>
                  <View style={{ paddingBottom: 10 }}>
                    <FormRadio
                      itemList={[
                        { title: 'V4 (New)', value: '4' },
                        { title: 'V3 (Old)', value: '3' },
                      ]}
                      selectedValue={selectedKeystoreVer}
                      onClick={setSelectedKeystoreVer}
                    />
                  </View>
                  {keystoreV4 && selectedKeystoreVer === '4' && (
                    <>
                      <CodeBlock
                        text={JSON.stringify(keystoreV4, null, 2)}
                        toggle={false}
                      />
                      <FormDownload
                        fileData={JSON.stringify(keystoreV4, null, 2)}
                        fileName={`keystoreV4-${keyring.address}`}
                      />
                      <CodeBlock
                        title="caver-js code"
                        text={`const keystoreV4 = keyring.encrypt(password)`}
                      />
                    </>
                  )}
                  {keystoreV3 && selectedKeystoreVer === '3' && (
                    <>
                      <CodeBlock
                        text={JSON.stringify(keystoreV3, null, 2)}
                        toggle={false}
                      />
                      <FormDownload
                        fileData={JSON.stringify(keystoreV3, null, 2)}
                        fileName={`keystoreV3-${keyring.address}`}
                      />
                      <CodeBlock
                        title="caver-js code"
                        text={`const keystoreV3 = keyring.encryptV3(password)`}
                      />
                    </>
                  )}
                </CardSection>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default CreateKeystore
