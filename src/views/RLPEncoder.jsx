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
import { networkLinks } from '../consts/klaytnNetwork'
import Column from '../components/Column'
let caver

const INPUT_ERROR_MSG = '[ERROR] PLEASE ENTER THE CORRECT FORMAT OF INPUTS!'
const UNREGISTERED_ERROR_MSG = '[ERROR] UNREGISTERED ACCOUNT!'

const types = {
  legacyTransaction: 'Legacy Transaction ( REQUIRED : to, gas )',
  valueTransfer: 'Value Transfer ( REQUIRED : from, to, value, gas )',
  valueTransferMemo:
    'Value Transfer Memo ( REQUIRED : from, to, value, gas, input)',
  accountUpdate: 'Account Update ( REQUIRED : from, gas )',
  smartContractDeploy: 'Smart Contract Deploy ( REQUIRED : from, input, gas )',
  smartContractExecution:
    'Smart Contract Execution ( REQUIRED : from, to, input, gas )',
  cancel: 'Cancel ( REQUIRED : from, gas )',
  chainDataAnchoring: 'Chain Data Anchoring ( REQUIRED : from, input, gas)',
  ethereumAccessList: 'Ethereum Access List ( REQUIRED : to, gas )',
  ethereumDynamicFee: 'Ethereum Dynamic Fee ( REQUIRED : to, gas )',
}

const examples = {
  legacyTransaction: `[JSON FORMAT EXAMPLE]
    {
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "3",
        "gas": "25000"
    }`,
  valueTransfer: `[JSON FORMAT EXAMPLE]
    {
        "from": "0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6",
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "5",
        "gas": "25000"
    }`,
  valueTransferMemo: `[JSON FORMAT EXAMPLE]
    {
        "from": "0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6",
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "7",
        "gas": "25000",
        "input": "0x68656c6c6f"
    }`,
  accountUpdate: `[JSON FORMAT EXAMPLE]
    {
        "from": "0xeeec7a5d061e90f62153a728d07f8d39139a83b2",
        "gas": "25000"
    }`,
  smartContractDeploy: `[JSON FORMAT EXAMPLE]
    {
        "from": "0x8b56758b52cc56a7a0ab4c9d7698c73737edccba",
        "input": "0xb6b55f25000000000000000000000000000000000000000000000025424176fc73dd7156",
        "gas": "139944"
    }`,
  smartContractExecution: `[JSON FORMAT EXAMPLE]
    {
        "from": "0xbb42218d2b2e6f0ea253c3b3917ed377c5aa86be",
        "to": "0x2bc652f0a7cedcaa334afe73520eeeaea6017739",
        "input": "0xa9059cbb0000000000000000000000000e9648a7d5fa246a04b342c74a4e5e75b45feb7e0000000000000000000000000000000000000000000000000000000000000005",
        "gas": "59138"
    }`,
  cancel: `[JSON FORMAT EXAMPLE]
    {
        "from": "0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6",
        "nonce": "12",
        "gas": "25000"
    }`,
  chainDataAnchoring: `[JSON FORMAT EXAMPLE]
    {
        "from": "0xb5d6e83dc403a2074ce54b621519e5e7376770ff",
        "gas": "100000",
        "input": "0xf8b480b8b1f8afa06c3cab56d8b7b7c94e7d3f311f2900ef93e0aede964a1db5939e61d4a707fe39a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470a0f045bd6e3e47113e707a49effc1b9c7035534ce8662dfda3a0b651fa64b13575a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470a0c6dec550c15f517d4a57503aeb9222b7d20a582b9f5d631b9e5e6fe13711ef8b83743088820258820145"
    }`,
  ethereumAccessList: `[JSON FORMAT EXAMPLE]
    {
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "6",
        "gas": "40000",
        "accessList": [
            {
                "address": "0x5430192ae264b3feff967fc08982b9c6f5694023",
                "storageKeys": [
                    "0x0000000000000000000000000000000000000000000000000000000000000003",
                    "0x0000000000000000000000000000000000000000000000000000000000000007"
                ]
            }
        ]
    }`,
  ethereumDynamicFee: `[JSON FORMAT EXAMPLE]
    {
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "12",
        "gas": "50000"
    }`,
}

class RLPEncoder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: '',
      network: 'mainnet',
      txType: 'legacyTransaction',
      tx: '',
      val: '',
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
  }

  componentDidMount() {
    caver = new Caver(
      new Caver.providers.HttpProvider(networkLinks[this.state.network]['rpc'])
    )
  }

  handleTransactionType = (e) => {
    this.setState({
      txType: e.target.value,
    })
  }

  copyToClipboard = () => {
    const el = this.copy
    el.select()
    document.execCommand('copy')
  }

  encodeTx = async () => {
    const { tx, txType } = this.state
    try {
      let jsonTx = JSON.parse(tx)
      if (jsonTx.hasOwnProperty('value')) {
        jsonTx['value'] = caver.utils.convertToPeb(jsonTx['value'], 'KLAY')
      }
      let encodedTx

      if (txType === 'legacyTransaction') {
        encodedTx = await caver.transaction.legacyTransaction.create(jsonTx)
      } else if (txType === 'valueTransfer') {
        encodedTx = await caver.transaction.valueTransfer.create(jsonTx)
      } else if (txType === 'valueTransferMemo') {
        encodedTx = await caver.transaction.valueTransferMemo.create(jsonTx)
      } else if (txType === 'accountUpdate') {
        let account
        try {
          let accountKey = await caver.rpc.klay.getAccountKey(jsonTx['from'])
          let rlpEncodedAccountKey = await caver.rpc.klay.encodeAccountKey(
            accountKey
          )
          account = await caver.account.createFromRLPEncoding(
            jsonTx['from'],
            rlpEncodedAccountKey
          )
        } catch (err) {
          this.setState({ result: UNREGISTERED_ERROR_MSG })
          return
        }
        jsonTx['account'] = account
        encodedTx = await caver.transaction.accountUpdate.create(jsonTx)
      } else if (txType === 'smartContractDeploy') {
        encodedTx = await caver.transaction.smartContractDeploy.create(jsonTx)
      } else if (txType === 'smartContractExecution') {
        encodedTx = await caver.transaction.smartContractExecution.create(
          jsonTx
        )
      } else if (txType === 'cancel') {
        encodedTx = await caver.transaction.cancel.create(jsonTx)
      } else if (txType === 'chainDataAnchoring') {
        encodedTx = await caver.transaction.chainDataAnchoring.create(jsonTx)
      } else if (txType === 'ethereumAccessList') {
        encodedTx = await caver.transaction.ethereumAccessList.create(jsonTx)
      } else if (txType === 'ethereumDynamicFee') {
        encodedTx = await caver.transaction.ethereumDynamicFee.create(jsonTx)
      }
      await encodedTx.fillTransaction()
      this.setState({ result: encodedTx.getRLPEncoding() })
    } catch (err) {
      this.setState({ result: INPUT_ERROR_MSG })
    }
  }

  render() {
    const { tx, txType, result } = this.state
    return (
      <div>
        <Column>
          <Card>
            <CardHeader>
              <h3 className="title">RLP Encoder</h3>
              <p style={{ color: '#6c757d' }}>
                On this page, you can get a RLP-encoded transaction string for
                each transaction type.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="4">
                  <FormGroup>
                    <Label>Transaction Type</Label>
                    <select
                      onChange={(e) => this.handleTransactionType(e)}
                      className="form-control"
                    >
                      <option value="legacyTransaction">
                        {' '}
                        Legacy Transaction
                      </option>
                      <option value="valueTransfer"> Value Transfer</option>
                      <option value="valueTransferMemo">
                        {' '}
                        Value Transfer Memo
                      </option>
                      <option value="accountUpdate"> Account Update</option>
                      <option value="smartContractDeploy">
                        {' '}
                        Smart Contract Deploy
                      </option>
                      <option value="smartContractExecution">
                        {' '}
                        Smart Contract Execution
                      </option>
                      <option value="cancel"> Cancel</option>
                      <option value="chainDataAnchoring">
                        {' '}
                        Chain Data Anchoring
                      </option>
                      <option value="ethereumAccessList">
                        {' '}
                        Ethereum Access List
                      </option>
                      <option value="ethereumDynamicFee">
                        {' '}
                        Ethereum Dynamic Fee
                      </option>
                    </select>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Label>{types[txType]}</Label>
                  <textarea
                    className="form-control"
                    value={tx}
                    onChange={(e) => this.handleInputChange(e)}
                    placeholder={examples[txType]}
                    style={{
                      height: '350px',
                      backgroundColor: '#adb5bd',
                      color: 'black',
                    }}
                    name="tx"
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <Button onClick={() => this.encodeTx()}>Encode</Button>
                </Col>
              </Row>
              {result &&
              result !== INPUT_ERROR_MSG &&
              result !== UNREGISTERED_ERROR_MSG ? (
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

export default RLPEncoder
