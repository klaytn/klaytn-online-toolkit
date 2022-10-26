import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Transaction } from 'caver-js'
import styled from 'styled-components'
import _ from 'lodash'

import { URLMAP } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Row,
  Label,
  Column,
  Text,
  View,
  FormTextarea,
  CopyButton,
  ResultForm,
} from 'components'
import { ResultFormType } from 'types'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

const RLPDecoder = (): ReactElement => {
  const [rlpEncoded, setRlpEncoded] = useState('')
  const [result, setResult] = useState<ResultFormType<Transaction>>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exValue =
    '0x38e40c850ba43b74008261a8947d0104ac150f749d36bb34999bcade9f2c0bd2e6c4c3018080'

  const rlpDecode = async () => {
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
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">RLP Decoder</h3>
          <Text>
            You can get the transaction by decoding the RLP-encoded transaction
            string.
          </Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>RLP-Encoded Transaction</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${exValue}`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setRlpEncoded(exValue)
                  }}
                >
                  Try
                </Button>
                <CopyButton text={exValue} buttonProps={{ size: 'sm' }}>
                  Copy
                </CopyButton>
              </View>
            </Row>
            <FormTextarea
              style={{ height: 100 }}
              value={rlpEncoded}
              onChange={setRlpEncoded}
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={rlpDecode}>Decode</Button>
          </StyledSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default RLPDecoder
