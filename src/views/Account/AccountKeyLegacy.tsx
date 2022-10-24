import { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
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
} from 'components'

const StyledSection = styled(View)`
  padding: 10px;
  background-color: #262626;
  margin-bottom: 20px;
  border-radius: 10px;
`

const AccountKeyLegacy = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])
  const [privateKey, setPrivateKey] = useState('')
  const [password, setPassword] = useState('')
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
          <h3 className="title">AccountKeyLegacy</h3>
          <Text>Here you can get your account from a private key</Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>Private Key</Label>
            <FormInput
              value={privateKey}
              onChange={setPrivateKey}
              placeholder="Input private key"
            />
            {keyringErrMsg && (
              <Text style={{ color: COLOR.error }}>{keyringErrMsg}</Text>
            )}
            <Button onClick={generateKey}>Generate a private key</Button>
            <CodeBlock
              title="caver-js code"
              text={`const key = caver.wallet.keyring.generateSingleKey()`}
            />
          </StyledSection>
          {keyring && (
            <>
              <StyledSection>
                <Label>SingleKeyring from the private key</Label>
                <CodeBlock
                  text={JSON.stringify(keyring, null, 2)}
                  toggle={false}
                />
                <CodeBlock
                  title="caver-js code"
                  text={`const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
                />
              </StyledSection>
              <StyledSection>
                <Label>Password to generate a keystore</Label>
                <FormInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Input password"
                />
                <Button onClick={generateKeystores}>Generate keystores</Button>
              </StyledSection>
              {keystoreV4 && (
                <StyledSection>
                  <Label>Keystore V4 (New)</Label>

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
                </StyledSection>
              )}
              {keystoreV3 && (
                <StyledSection>
                  <Label>Keystore V3 (Old)</Label>

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
                </StyledSection>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default AccountKeyLegacy
