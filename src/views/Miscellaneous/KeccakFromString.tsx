import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'

import { URLMAP } from 'consts'
import {
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

const KeccakFromString = (): ReactElement => {
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState<ResultFormType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exValue = 'Hello klaytn'

  const encodeABI = async (): Promise<void> => {
    setResult(undefined)
    try {
      const res = caver.utils.sha3(inputValue) || ''
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
    encodeABI()
  }, [inputValue])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Keccak256 from String</h3>
          <Text> Keccak-256 online hash function</Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Input</Label>
            <CardExample exValue={exValue} onClickTry={setInputValue} />
            <View style={{ paddingBottom: 10 }}>
              <FormTextarea
                style={{ height: 100 }}
                value={inputValue}
                onChange={setInputValue}
                placeholder="Enter the comma-separated value types."
              />
            </View>
            <CodeBlock
              title="caver-js code"
              text={`const sha3 = caver.utils.sha3(inputValue)`}
            />
          </CardSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default KeccakFromString
