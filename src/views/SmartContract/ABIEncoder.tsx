import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'

import { URLMAP } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Container,
  Text,
  FormTextarea,
  ResultForm,
  CardSection,
  CodeBlock,
  CardExample,
  View,
} from 'components'
import { ResultFormType } from 'types'

const ABIEncoder = (): ReactElement => {
  const [argTypes, setArgTypes] = useState('')
  const [argValues, setArgValues] = useState('')
  const [result, setResult] = useState<ResultFormType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exType = '"bool", "address", "uint8[]", "string"'
  const exValue =
    'true, "0x77656c636f6d6520746f20657468657265756d2e", [34, 255], "Hello!%"'

  const encodeABI = async (): Promise<void> => {
    setResult(undefined)
    try {
      const types = JSON.parse(`[${argTypes}]`)
      const values = JSON.parse(`[${argValues}]`)
      const res = caver.abi.encodeParameters(types, values)
      setResult({
        success: true,
        value: res,
      })
    } catch (err) {
      setResult({
        success: false,
        message: _.toString(err),
      })
    }
  }

  useEffect(() => {
    setResult(undefined)
  }, [argTypes, argValues])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">ABI Encoder</h3>
          <Text>Will encode Solidity ABI data.</Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <View style={{ rowGap: 10 }}>
              <View>
                <Label>Argument Types</Label>
                <CardExample exValue={exType} onClickTry={setArgTypes} />
                <FormTextarea
                  style={{ height: 100 }}
                  value={argTypes}
                  onChange={setArgTypes}
                  placeholder="Enter the comma-separated value types."
                />
              </View>
              <View>
                <Label>Argument Values</Label>
                <CardExample exValue={exValue} onClickTry={setArgValues} />
                <FormTextarea
                  style={{ height: 100 }}
                  value={argValues}
                  onChange={setArgValues}
                  placeholder="Enter the comma-separated values to match the number of types shown above."
                />
              </View>
              <Button onClick={encodeABI}>Encode</Button>
              <CodeBlock
                title="caver-js code"
                text={`types: (string | object)[]
params: any[]

const encoded = caver.abi.encodeParameters(types, params)`}
              />
            </View>
          </CardSection>

          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default ABIEncoder
