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
  const [argValues, setArgValues] = useState('')
  const [result, setResult] = useState<ResultType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exType = '"bool", "address", "uint8[]", "string"'
  const exValue =
    'true, "0x77656c636f6d6520746f20657468657265756d2e", [34, 255], "Hello!%"'

  const encodeABI = async () => {
    setResult(undefined)
    try {
      const types = JSON.parse(`[${argTypes}]`)
      const values = JSON.parse(`[${argValues}]`)
      const res = caver.abi.encodeParameters(types, values)
      setResult({
        success: true,
        value: res || '',
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
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">ABI Encoder</h3>
          <Text>The tool is designed to encode Solidity ABI data.</Text>
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
            <Label>Argument Values</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${exValue}`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setArgValues(exValue)
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
              value={argValues}
              onChange={setArgValues}
              placeholder="Enter the comma-separated values to match the number of types shown above."
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={encodeABI}>Encode</Button>
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
