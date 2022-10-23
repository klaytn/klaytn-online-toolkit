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
  FormRadio,
} from 'components'
import { ButtonGroup } from 'reactstrap'

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

enum InputTypeEnum {
  STRING = 'STRING',
  ABI = 'ABI',
}

const EX_VALUE = {
  [InputTypeEnum.STRING]: 'myMethod(uint256,string)',
  [InputTypeEnum.ABI]:
    '{"name":"myMethod","type":"function","inputs":[{"type":"uint256","name":"myNumber"},{"type":"string","name":"mystring"}]}',
}

const FunctionSignature = (): ReactElement => {
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState<ResultType>()
  const [inputType, setInputType] = useState<InputTypeEnum>(
    InputTypeEnum.STRING
  )

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])
  const exValue = useMemo(() => EX_VALUE[inputType], [inputType])

  const encode = async () => {
    setResult(undefined)
    try {
      const param =
        inputType === InputTypeEnum.STRING ? inputValue : JSON.parse(inputValue)
      const res = caver.abi.encodeFunctionSignature(param)
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
    encode()
  }, [inputValue])

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Encode Function Signature</h3>
          <Text>
            Encodes the function signature to its ABI signature, which are the
            first 4 bytes of the sha3 hash of the function name including
            parameter types.
          </Text>
        </CardHeader>
        <CardBody>
          <StyledSection style={{ width: 200 }}>
            <ButtonGroup
              className="btn-group-toggle float-left"
              data-toggle="buttons"
              style={{ marginBottom: '1rem' }}
            >
              <FormRadio
                itemList={[
                  { title: 'String', value: InputTypeEnum.STRING },
                  { title: 'ABI', value: InputTypeEnum.ABI },
                ]}
                selectedValue={inputType}
                onClick={setInputType}
              />
            </ButtonGroup>
          </StyledSection>
          <StyledSection>
            <Label>Input</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${exValue}`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setInputValue(exValue)
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
              value={inputValue}
              onChange={setInputValue}
              placeholder="Enter the comma-separated value types."
            />
          </StyledSection>

          {result && (
            <>
              {result.success ? (
                <StyledSection>
                  <Label>Function Signature</Label>
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

export default FunctionSignature
