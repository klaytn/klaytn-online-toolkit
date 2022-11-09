import { ReactElement, useEffect, useState } from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { Keystore, Keyring } from 'caver-js'

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
} from 'components'

import {
  createFromPrivateKey,
  generateSingleKey,
  keyringDecrypt,
} from 'logics/caverFuncntions'

export type GetKeyFrom = 'privateKey' | 'keystore'

const StyledContainer = styled(View)`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px;
`

const FormGetKey = ({
  keyring,
  setKeyring,
}: {
  keyring?: Keyring
  setKeyring: (value?: Keyring) => void
}): ReactElement => {
  const [getKeyFrom, setGetKeyFrom] = useState<GetKeyFrom>('privateKey')
  const [privateKey, setPrivateKey] = useState('')
  const [keyringErrMsg, setKeyringErrMsg] = useState('')
  const [keystoreJSON, setKeystoreJSON] = useState<Keystore>()
  const [keystorePassword, setKeystorePassword] = useState('')

  const handleKeystoreChange = (files?: FileList) => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setKeystoreJSON(json)
        }
      }
    }
  }

  const onClickDecryptKeystore = (): void => {
    try {
      keystoreJSON && setKeyring(keyringDecrypt(keystoreJSON, keystorePassword))
    } catch (error) {
      setKeyringErrMsg(_.toString(error))
    }
  }

  useEffect(() => {
    if (getKeyFrom === 'privateKey' && privateKey) {
      try {
        setKeyring(createFromPrivateKey(privateKey))
      } catch (error) {
        setKeyringErrMsg(_.toString(error))
      }
    } else if (getKeyFrom === 'keystore' && keystoreJSON) {
      try {
        setKeyring(keyringDecrypt(keystoreJSON, ''))
      } catch {
        // just try decrypt
      }
    }

    return () => {
      setKeyring(undefined)
      setKeyringErrMsg('')
    }
  }, [privateKey, keystoreJSON, getKeyFrom])

  useEffect(() => {
    setKeystorePassword('')
  }, [keystoreJSON])

  return (
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
            <Button
              size="sm"
              onClick={(): void => setPrivateKey(generateSingleKey())}
            >
              Generate
            </Button>
          </Row>

          <CodeBlock
            title="caver-js code"
            text={`const privateKey = caver.wallet.keyring.generateSingleKey()
const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
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
          {keystoreJSON && !keyring && (
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
  )
}

export default FormGetKey
