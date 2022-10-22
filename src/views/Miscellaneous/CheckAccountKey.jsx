import { Component } from 'react'
import { Button, Card, CardHeader, CardBody, Row, Col } from 'reactstrap'
import { InputField } from 'components'
import Caver from 'caver-js'
import { networkLinks } from 'consts/klaytnNetwork'
import { Column } from 'components'
let caver

const idToType = {
  1: 'AccountKeyLegacy',
  2: 'AccountKeyPublic',
  3: 'AccountKeyFail (used for Smart Contract Accounts)',
  4: 'AccountKeyWeightedMultiSig',
  5: 'AccountKeyRoleBased',
}

class CheckAccountKey extends Component {
  constructor(props) {
    super(props)
    this.state = {
      network: 'mainnet',
      address: '',
      result: '',
      accountKey: '',
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

  checkAccountKey = async () => {
    const { address } = this.state

    try {
      let result = null
      const res = await caver.rpc.klay.getAccountKey(address)
      if (res === null) {
        result = 'The address does not exist on the actual blockchain network.'
      } else {
        result = res.keyType
      }

      this.setState({
        result,
        accountKey: res,
      })
    } catch (error) {
      this.setState({
        result: error.toString(),
        accountKey: '',
      })
    }
  }

  render() {
    const { address, accountKey, result } = this.state
    return (
      <Column>
        <Card>
          <CardHeader>
            <h3 className="title">Check Account Key Type</h3>
            <p style={{ color: '#6c757d' }}>
              You can check the account key of the Externally Owned Account
              (EOA) of the given address. The account key consist of public
              key(s) and a key type. If the account has AccountKeyLegacy or the
              account of the given address is a Smart Contract Account, it will
              return an empty key value.
            </p>
            <Row>
              <Col md="4">
                <select
                  onChange={(e) => this.handleNetworkChange(e)}
                  className="form-control"
                >
                  <option value="mainnet"> Mainnet</option>
                  <option value="testnet"> Testnet</option>
                </select>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md="6">
                <InputField
                  type="text"
                  value={address}
                  placeholder="Address"
                  label="Address"
                  name="address"
                  onChange={this.handleInputChange}
                />
              </Col>
              <Col md="4">
                <Button
                  style={{ marginTop: '1.75rem' }}
                  onClick={(e) => this.checkAccountKey(e)}
                >
                  Check
                </Button>
              </Col>
            </Row>

            {idToType.hasOwnProperty(result) ? (
              <div>
                <p style={{ fontSize: '15px' }}>
                  The account key type of given address is {idToType[result]}.
                </p>
                <Row>
                  <Col md="8">
                    <textarea
                      className="form-control"
                      style={{
                        height: '100px',
                        backgroundColor: '#adb5bd',
                        color: 'black',
                      }}
                      value={JSON.stringify(accountKey)}
                      readOnly
                    />
                  </Col>
                </Row>
              </div>
            ) : result !== '' ? (
              <p style={{ fontSize: '15px' }}> {result} </p>
            ) : null}
          </CardBody>
        </Card>
      </Column>
    )
  }
}

export default CheckAccountKey
