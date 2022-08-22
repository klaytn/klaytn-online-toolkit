import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Result } from 'caver-js'
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
} from 'components'
import { ResultFormType } from 'types'

const ABIEncoder = (): ReactElement => {
  const [argTypes, setArgTypes] = useState('')
  const [encodedData, setEncodedData] = useState('')
  const [result, setResult] = useState<ResultFormType<Result>>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exType = '"uint256"'
  const exData =
    '0x000000000000000000000009b02b6aef2f4c6d5f1a5aae08bf77321e33e476e6'

  const encodeABI = async (): Promise<void> => {
    setResult(undefined)
    try {
      const types = JSON.parse(`[${argTypes}]`)
      const res = caver.abi.decodeParameters(types, encodedData)
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
  }, [argTypes, encodedData])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">ABI Decoder</h3>
          <Text>The tool is designed to decode ABI encoded parameters.</Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Argument Types</Label>
            <CardExample exValue={exType} onClickTry={setArgTypes} />
            <FormTextarea
              style={{ height: 100 }}
              value={argTypes}
              onChange={setArgTypes}
              placeholder="Enter the comma-separated value types."
            />
          </CardSection>
          <CardSection>
            <Label>Encoded Data</Label>
            <CardExample exValue={exData} onClickTry={setEncodedData} />
            <FormTextarea
              style={{ height: 100 }}
              value={encodedData}
              onChange={setEncodedData}
              placeholder=" Enter the encoded data to be decoded."
            />
          </CardSection>
          <CardSection>
            <Button onClick={encodeABI}>Decode</Button>
            <CodeBlock
              title="caver-js code"
              text={`types: (string | object)[]
encodedData: string

const decoded = caver.abi.decodeParameters(types, encodedData)`}
            />
          </CardSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default ABIEncoder
