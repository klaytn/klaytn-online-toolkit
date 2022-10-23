import { ReactElement, useMemo, useState } from 'react'
import styled from 'styled-components'
import Caver, { Keystore } from 'caver-js'
import _ from 'lodash'
import { Card, CardHeader, CardBody } from 'reactstrap'

import { URLMAP, UTIL } from 'consts'
import {
  Button,
  Column,
  View,
  Label,
  Text,
  FormInput,
  ResultForm,
} from 'components'
import FormFile from 'components/FormFile'
import { ResultFormType } from 'types'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

const LoadKeystore = (): ReactElement => {
  const [keystoreJSON, setKeystoreJSON] = useState<Keystore>()
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<ResultFormType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

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

  const decrypt = () => {
    if (keystoreJSON) {
      //decrypt and add priv key to PrivKey list
      try {
        const keyring = caver.wallet.keyring.decrypt(keystoreJSON, password)
        const message = `${keyring.type} ${JSON.stringify(keyring)}`

        setResult({
          success: true,
          value: message,
        })
      } catch (err) {
        setResult({
          success: false,
          message: _.toString(err),
        })
      }
    } else {
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Load Keystore File</h3>
          <Text>
            Decrypt a keystore v3 or v4 JSON and return the decrypted Keyring
            instance.{' '}
          </Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>Keystore</Label>
            <FormFile
              placeholder="Keystore File"
              accept=".json"
              onChange={handleKeystoreChange}
            />
          </StyledSection>
          <StyledSection>
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setPassword}
              value={password}
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={decrypt}>Decrypt</Button>
          </StyledSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default LoadKeystore
