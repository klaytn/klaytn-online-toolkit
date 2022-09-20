import { ReactElement, useState } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
  Column,
} from 'components'
import { networkLinks } from '../constants/klaytnNetwork'

const caver = new Caver(
  new Caver.providers.HttpProvider(networkLinks['mainnet']['rpc'])
)

const INPUT_ERROR_MSG = '[ERROR] PLEASE USE THE CORRECT FORMAT OF INPUTS!'

const ABIEncoder = (): ReactElement => {
  const [result, setResult] = useState('')
  const [argumentTypes, setArgumentTypes] = useState('')
  const [argumentValues, setArgumentValues] = useState('')

  const encodeABI = async () => {
    const typesArray: string[] = argumentTypes.split(' ')
    let parameters: any[] = argumentValues.split(' ')

    try {
      for (let i = 0; i < typesArray.length; i++) {
        if (typesArray[i] === 'bool') {
          if (parameters[i] === 'true') {
            parameters[i] = true
          } else if (parameters[i] === 'false') {
            parameters[i] = false
          } else {
            throw new Error()
          }
        }

        if (
          String(parameters[i]).startsWith('[') &&
          String(parameters[i]).endsWith(']')
        ) {
          parameters[i] = String(parameters[i].replace(/(\[|\])/gi, '')).split(
            ','
          )
        }
      }
    } catch {
      setResult(INPUT_ERROR_MSG)
    }

    try {
      const res = await caver.abi.encodeParameters(typesArray, parameters)

      setResult(res || '')
    } catch (error) {
      setResult(_.toString(error))
    }
  }

  return (
    <div>
      <Column>
        <Card>
          <CardHeader>
            <h3 className="title">ABI Encoder</h3>
            <p style={{ color: '#6c757d' }}>
              The tool is designed to encode Solidity ABI data.
            </p>
          </CardHeader>
          <CardBody>
            <Row>
              <Col>
                <Label>Argument Types</Label>
                <p style={{ color: '#6c757d' }}>
                  Enter the space-separated value types.
                </p>
                <textarea
                  className="form-control"
                  value={argumentTypes}
                  onChange={({ target: { value } }): void => {
                    setArgumentTypes(value)
                  }}
                  placeholder="Argument Types (input example : bool address)"
                  style={{
                    height: '120px',
                    backgroundColor: '#adb5bd',
                    color: 'black',
                  }}
                  name="argumentTypes"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Label>Argument Values</Label>
                <p style={{ color: '#6c757d' }}>
                  Enter the space-separated values to match the number of types
                  indicated above, using square brackets [] to wrap arrays.
                  <br></br>
                </p>
                <textarea
                  className="form-control"
                  value={argumentValues}
                  onChange={({ target: { value } }): void => {
                    setArgumentValues(value)
                  }}
                  placeholder="Argument Values (input example : true 0x77656c636f6d6520746f20657468657265756d2e)"
                  style={{
                    height: '120px',
                    backgroundColor: '#adb5bd',
                    color: 'black',
                  }}
                  name="argumentValues"
                />
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <Button onClick={(e) => encodeABI()}>ENCODE</Button>
              </Col>
            </Row>
            {result &&
              (result !== INPUT_ERROR_MSG ? (
                <Row>
                  <Col md="12">
                    <Label>Result</Label>
                    <textarea
                      className="form-control"
                      style={{
                        height: '120px',
                        backgroundColor: '#adb5bd',
                        color: 'black',
                      }}
                      value={result}
                      readOnly
                    />
                  </Col>
                </Row>
              ) : (
                <p style={{ color: '#c221a9' }}> {result} </p>
              ))}
          </CardBody>
        </Card>
      </Column>
    </div>
  )
}

export default ABIEncoder
