import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Transaction } from 'caver-js'
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

const RLPDecoder = (): ReactElement => {
  const [rlpEncoded, setRlpEncoded] = useState('')
  const [result, setResult] = useState<ResultFormType<Transaction>>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exValue =
    '0x38e40c850ba43b74008261a8947d0104ac150f749d36bb34999bcade9f2c0bd2e6c4c3018080'

  const rlpDecode = async (): Promise<void> => {
    setResult(undefined)
    try {
      const res = caver.transaction.decode(rlpEncoded)
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
  }, [rlpEncoded])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">RLP Decoder</h3>
          <Text>
            You can get the transaction by decoding the RLP-encoded transaction
            string.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>RLP-Encoded Transaction</Label>
            <CardExample exValue={exValue} onClickTry={setRlpEncoded} />
            <FormTextarea
              style={{ height: 100 }}
              value={rlpEncoded}
              onChange={setRlpEncoded}
            />
          </CardSection>
          <CardSection>
            <Button onClick={rlpDecode}>Decode</Button>
            <CodeBlock
              title="caver-js code"
              text={`const decoded = caver.transaction.decode(rlpEncoded)`}
            />
          </CardSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default RLPDecoder
