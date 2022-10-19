import React, { Component } from 'react'
import { Button, Card, CardHeader, CardBody, Row, Col, Label } from 'reactstrap'
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from '../components/Column'

const caver = new Caver(
  new Caver.providers.HttpProvider(networkLinks['mainnet']['rpc'])
)

const INPUT_ERROR_MSG = '[ERROR] PLEASE ENTER THE CORRECT FORMAT OF INPUTS!'

class ABIDecoder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: '',
      argumentTypes: '',
      encodedData: '',
      copy: '',
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
  }

  copyToClipboard = () => {
    const el = this.copy
    el.select()
    document.execCommand('copy')
  }

  decodeABI = async () => {
    try {
      const { argumentTypes, encodedData } = this.state
      const types = JSON.parse('[' + argumentTypes + ']')
      const res = await caver.abi.decodeParameters(types, encodedData)
      if (res) {
        this.setState({ result: JSON.stringify(res, null, 2) })
      } else {
        this.setState({ result: '' })
      }
    } catch (err) {
      this.setState({ result: INPUT_ERROR_MSG })
    }
  }

  render() {
    const { argumentTypes, encodedData, result } = this.state
    return (
      <div>
        <Column>
          <Card>
            <CardHeader>
              <h3 className="title">ABI Decoder</h3>
              <p style={{ color: '#6c757d' }}>
                The tool is designed to decode ABI encoded parameters.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <Label>Argument Types</Label>
                  <p style={{ color: '#6c757d' }}>
                    Enter the comma-separated value types.
                  </p>
                  <textarea
                    className="form-control"
                    value={argumentTypes}
                    onChange={this.handleInputChange}
                    placeholder='Argument Types ( Example : "uint256" )'
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
                  <Label>Encoded Data</Label>
                  <p style={{ color: '#6c757d' }}>
                    Enter the encoded data to be decoded.
                  </p>
                  <textarea
                    className="form-control"
                    value={encodedData}
                    onChange={this.handleInputChange}
                    placeholder="Encoded Data ( Example : 0x000000000000000000000009b02b6aef2f4c6d5f1a5aae08bf77321e33e476e6 )"
                    style={{
                      height: '120px',
                      backgroundColor: '#adb5bd',
                      color: 'black',
                    }}
                    name="encodedData"
                  />
                </Col>
              </Row>
              <Row>
                <Col md="4">
                  <Button onClick={(e) => this.decodeABI()}>DECODE</Button>
                </Col>
              </Row>
              {result && result !== INPUT_ERROR_MSG ? (
                <Row>
                  <Col>
                    <Label>Result</Label>
                    <textarea
                      className="form-control"
                      ref={(textarea) => (this.copy = textarea)}
                      style={{
                        height: '120px',
                        backgroundColor: '#adb5bd',
                        color: 'black',
                      }}
                      value={result}
                      readOnly
                    />
                    <Button onClick={() => this.copyToClipboard()}>
                      Copy To Clipboard
                    </Button>
                  </Col>
                </Row>
              ) : (
                <p style={{ color: '#c221a9' }}> {result} </p>
              )}
            </CardBody>
          </Card>
        </Column>
      </div>
    )
  }
}

export default ABIDecoder
