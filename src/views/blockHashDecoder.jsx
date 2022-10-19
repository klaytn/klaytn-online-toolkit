import React, { Component } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
  FormGroup,
} from 'reactstrap'
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from '../components/Column'
let caver

const INPUT_ERROR_MSG =
  '[ERROR] PLEASE ENTER THE CORRECT VALUE OF BLOCK HASH OR CHECK THE NETWORK!'

class BlockHashDecoder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      network: 'mainnet',
      result: '',
      blockHash: '',
    }
  }

  componentDidMount() {
    caver = new Caver(
      new Caver.providers.HttpProvider(networkLinks[this.state.network]['rpc'])
    )
  }

  handleNetworkChange = (e) => {
    caver = new Caver(
      new Caver.providers.HttpProvider(networkLinks[e.target.value]['rpc'])
    )
    this.setState({
      network: e.target.value,
    })
  }

  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
  }

  copyToClipboard = () => {
    const el = this.result
    el.select()
    document.execCommand('copy')
  }

  decodeBlockHash = async () => {
    const { blockHash } = this.state
    try {
      const res = await caver.rpc.klay.getBlockByHash(blockHash)
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
    const { blockHash, result } = this.state
    return (
      <div>
        <Column>
          <Card>
            <CardHeader>
              <h3 className="title">Block Hash Decoder</h3>
              <p style={{ color: '#6c757d' }}>
                Here you can get block information by block hash.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="4">
                  <FormGroup>
                    <Label>Network</Label>
                    <select
                      onChange={(e) => this.handleNetworkChange(e)}
                      className="form-control"
                    >
                      <option value="mainnet"> Mainnet</option>
                      <option value="testnet"> Testnet</option>
                    </select>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Label>Block Hash</Label>
                  <p style={{ color: '#6c757d' }}>Enter the Block Hash.</p>
                  <textarea
                    className="form-control"
                    value={blockHash}
                    onChange={this.handleInputChange}
                    placeholder="Block Hash ( Example : 0x608d45ed14572c854036492dc08c131885ba5de294dd57e6c9468e1116f49063 )"
                    style={{
                      height: '80px',
                      backgroundColor: '#adb5bd',
                      color: 'black',
                    }}
                    name="blockHash"
                  />
                </Col>
              </Row>
              <Row>
                <Col md="4">
                  <Button onClick={(e) => this.decodeBlockHash()}>
                    DECODE
                  </Button>
                </Col>
              </Row>
              {result && result !== INPUT_ERROR_MSG ? (
                <Col>
                  <Row>
                    <Label>Block</Label>
                    <textarea
                      className="form-control"
                      ref={(textarea) => (this.result = textarea)}
                      style={{
                        height: '1000px',
                        backgroundColor: '#adb5bd',
                        color: 'black',
                      }}
                      value={result}
                      readOnly
                    />
                    <Button onClick={() => this.copyToClipboard()}>
                      Copy To Clipboard
                    </Button>
                  </Row>
                </Col>
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

export default BlockHashDecoder
