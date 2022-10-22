import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver from 'caver-js'
import styled from 'styled-components'
import _ from 'lodash'

import { COLOR, URLMAP } from 'consts'
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
} from 'components'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

type ResultType =
  | {
      success: true
      value: string
    }
  | {
      success: false
      message: string
    }

const ABIEncoder = (): ReactElement => {
  const [argTypes, setArgTypes] = useState('')
  const [encodedData, setEncodedData] = useState('')
  const [result, setResult] = useState<ResultType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exType = '"uint256"'
  const exData =
    '0x000000000000000000000009b02b6aef2f4c6d5f1a5aae08bf77321e33e476e6'

  const encodeABI = async () => {
    setResult(undefined)
    try {
      const types = JSON.parse(`[${argTypes}]`)
      const res = caver.abi.decodeParameters(types, encodedData)
      setResult({
        success: true,
        value: res ? JSON.stringify(res, null, 2) : '',
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
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">ABI Decoder</h3>
          <Text>The tool is designed to decode ABI encoded parameters.</Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>Argument Types</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${exType}`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setArgTypes(exType)
                  }}
                >
                  Try
                </Button>
                <CopyButton text={exType} buttonProps={{ size: 'sm' }}>
                  Copy
                </CopyButton>
              </View>
            </Row>
            <FormTextarea
              style={{ height: 100 }}
              value={argTypes}
              onChange={setArgTypes}
              placeholder="Enter the comma-separated value types."
            />
          </StyledSection>
          <StyledSection>
            <Label>Encoded Data</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${exData}`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setEncodedData(exData)
                  }}
                >
                  Try
                </Button>
                <CopyButton text={exData} buttonProps={{ size: 'sm' }}>
                  Copy
                </CopyButton>
              </View>
            </Row>
            <FormTextarea
              style={{ height: 100 }}
              value={encodedData}
              onChange={setEncodedData}
              placeholder=" Enter the encoded data to be decoded."
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={encodeABI}>Decode</Button>
          </StyledSection>
          {result && (
            <>
              {result.success ? (
                <StyledSection>
                  <Label>Result</Label>
                  <FormTextarea
                    style={{ height: 300 }}
                    value={result.value}
                    readOnly
                  />
                  <CopyButton text={result.value}>Copy the result</CopyButton>
                </StyledSection>
              ) : (
                <Text style={{ color: COLOR.error }}> {result.message} </Text>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default ABIEncoder
