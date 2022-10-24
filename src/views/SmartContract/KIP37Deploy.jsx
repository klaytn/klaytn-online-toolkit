import { InputField } from 'components'
import React, { Component } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardText,
  Row,
  Col,
  Label,
  FormGroup,
} from 'reactstrap'
import Column from '../../components/Column'
import { networkLinks } from '../../consts/klaytnNetwork'
import Caver from 'caver-js'
import BigNumber from 'bignumber.js'

let caver

class KIP37Deploy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      network: 'mainnet',
      senderAddress: '',
      senderKeystoreJSON: '',
      senderKeystorePassword: '',
      senderDecryptMessage: '',
      senderDecryptMessageVisible: false,
      deployMsg: null,
      deployMsgVisible: false,
      deployButtonDisabled: false,
      deploySuccess: false,
      contractAddress: '',
      uri: '',
      lastTokenId: 0,
      initialSupply: '',
      tokenURI: '',
      createMsg: null,
      createMsgVisible: false,
      createButtonDisabled: false,
      createSuccess: false,
      recipientAddress: '',
      tokenAmount: '',
      mintMsg: null,
      mintMsgVisible: false,
      mintButtonDisabled: false,
      mintSuccess: false,
    }
  }

  componentDidMount() {
    caver = new Caver(
      new Caver.providers.HttpProvider(networkLinks[this.state.network]['rpc'])
    )
  }

  onInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
  }

  handleNetworkChange = (e) => {
    caver = new Caver(
      new Caver.providers.HttpProvider(networkLinks[e.target.value]['rpc'])
    )
    this.setState({
      network: e.target.value,
    })
  }

  handleSenderKeystoreChange = (e) => {
    if (e.target.files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(e.target.files[0], 'UTF-8')
      fileReader.onload = (event) => {
        const parsedKeystore = JSON.parse(event.target.result)
        this.setState({
          senderKeystoreJSON: parsedKeystore,
        })
      }
    }
  }

  handleSenderPasswordChange = (e) => {
    const { value } = e.target
    this.setState({
      senderKeystorePassword: value,
    })
  }

  decryptSenderKeystore = (e) => {
    const { senderKeystoreJSON, senderKeystorePassword } = this.state
    try {
      if (senderKeystoreJSON !== null) {
        const keyring = caver.wallet.keyring.decrypt(
          senderKeystoreJSON,
          senderKeystorePassword
        )

        if (caver.wallet.isExisted(keyring.address)) {
          caver.wallet.updateKeyring(keyring)
        } else {
          caver.wallet.add(keyring)
        }

        this.setState({
          senderDecryptMessage: 'Decryption succeeds!',
          senderAddress: keyring.address,
          senderDecryptMessageVisible: true,
        })

        setTimeout(() => {
          this.setState({
            senderDecryptMessageVisible: false,
            senderDecryptMessage: '',
          })
        }, 5000)
      }
    } catch (e) {
      this.setState({
        senderDecryptMessage: e.toString(),
        senderDecryptMessageVisible: true,
        senderAddress: '',
      })
      setTimeout(() => {
        this.setState({
          senderDecryptMessageVisible: false,
          senderDecryptMessage: '',
        })
      }, 5000)
    }
  }

  deploy = async (e) => {
    const { senderAddress, uri } = this.state
    try {
      if (senderAddress === '') {
        throw Error('Sender Keystore is not uploaded!')
      }

      this.setState({
        deployButtonDisabled: true,
      })

      const kip37 = await caver.kct.kip37.deploy(
        {
          uri: uri,
        },
        { from: senderAddress }
      )

      this.setState({
        deployMsgVisible: true,
        deployMsg: `KIP-37 smart contract is successfully deployed! `,
        deployButtonDisabled: false,
        contractAddress: kip37.options.address,
        deploySuccess: true,
      })
    } catch (e) {
      this.setState({
        deployMsg: e.toString(),
        deployMsgVisible: true,
        deployButtonDisabled: false,
        contractAddress: '',
        deploySuccess: false,
      })

      setTimeout(() => {
        this.setState({
          deployMsgVisible: false,
          deployMsg: '',
        })
      }, 5000)
    }
  }

  create = async (e) => {
    const {
      contractAddress,
      senderAddress,
      lastTokenId,
      initialSupply,
      tokenURI,
    } = this.state
    try {
      this.setState({
        createButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip37(contractAddress)
      deployedContract.options.from = senderAddress
      const currentTokenId = lastTokenId
      const created = await deployedContract.create(
        currentTokenId,
        BigNumber(initialSupply),
        tokenURI
      )
      const newCreateMsg =
        'KIP-37 Token(Token ID: ' +
        currentTokenId +
        ') is successfully created!'

      if (created) {
        this.setState({
          createMsgVisible: true,
          createMsg: newCreateMsg,
          createButtonDisabled: false,
          lastTokenId: currentTokenId + 1,
          createSuccess: true,
        })
      } else {
        throw Error('Creating is failed')
      }
    } catch (e) {
      this.setState({
        createMsg: e.toString(),
        createMsgVisible: true,
        createButtonDisabled: false,
        initialSupply: '',
        tokenURI: '',
        createSuccess: false,
      })

      setTimeout(() => {
        this.setState({
          createMsgVisible: false,
          createMsg: '',
        })
      }, 5000)
    }
  }

  mint = async (e) => {
    const {
      contractAddress,
      senderAddress,
      lastTokenId,
      recipientAddress,
      tokenAmount,
    } = this.state
    try {
      this.setState({
        mintButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip37(contractAddress)
      deployedContract.options.from = senderAddress
      const currentTokenId = lastTokenId - 1
      const minted = await deployedContract.mint(
        recipientAddress,
        currentTokenId,
        tokenAmount
      )
      const newMintMsg =
        'KIP-37 Token(Token ID: ' + currentTokenId + ') is successfully minted!'

      if (minted) {
        this.setState({
          mintMsgVisible: true,
          mintMsg: newMintMsg,
          mintButtonDisabled: false,
          mintSuccess: true,
        })
      } else {
        throw Error('Minting is failed')
      }
    } catch (e) {
      this.setState({
        mintMsg: e.toString(),
        mintMsgVisible: true,
        mintButtonDisabled: false,
        recipientAddress: '',
        tokenAmount: '',
        mintSuccess: false,
      })

      setTimeout(() => {
        this.setState({
          mintMsgVisible: false,
          mintMsg: '',
        })
      }, 5000)
    }
  }

  render() {
    const {
      senderKeystorePassword,
      senderDecryptMessage,
      senderDecryptMessageVisible,
      deployMsg,
      deployMsgVisible,
      deployButtonDisabled,
      deploySuccess,
      contractAddress,
      network,
      uri,
      initialSupply,
      tokenURI,
      senderAddress,
      createMsg,
      createMsgVisible,
      createButtonDisabled,
      createSuccess,
      recipientAddress,
      tokenAmount,
      mintMsg,
      mintMsgVisible,
      mintButtonDisabled,
      mintSuccess,
    } = this.state
    return (
      <Column>
        <Card>
          <CardHeader>
            <h3 className="title">Deploy KIP-37 Token</h3>
            <p style={{ color: '#6c757d' }}>
              Here you can deploy a KIP-37 smart contract to the Klaytn Cypress
              or Baobab network. Please refer to{' '}
              <a href="http://kips.klaytn.foundation/KIPs/kip-37">
                KIP-37: Token Standard
              </a>{' '}
              and{' '}
              <a href="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip37">
                caver.kct.kip37
              </a>
              .
            </p>
          </CardHeader>
          <CardBody>
            <h3 className="title"> Upload Deployer Keystore File</h3>
            <p style={{ color: '#6c757d' }}>
              Upload the Keystore file. This account must have enough KLAY to
              deploy a KIP-37 smart contract.
            </p>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label> Network </Label>
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
              <Col md="8">
                <InputField
                  name="keystore"
                  type="file"
                  id="Keystore"
                  label="Keystore"
                  placeholder="Keystore File"
                  accept=".json"
                  onChange={(e) => this.handleSenderKeystoreChange(e)}
                />
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <InputField
                  type="password"
                  name="password"
                  placeholder="Password"
                  label="Password"
                  onChange={(e) => this.handleSenderPasswordChange(e)}
                  value={senderKeystorePassword}
                />
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <Button onClick={(e) => this.decryptSenderKeystore(e)}>
                  Decrypt
                </Button>
              </Col>
            </Row>
            {senderDecryptMessageVisible && (
              <Row>
                <Col md="8">
                  <CardText style={{ color: '#c221a9' }}>
                    {senderDecryptMessage}
                  </CardText>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="title">KIP-37 Token Information</h3>
            <p style={{ color: '#6c757d' }}>
              Enter the KIP-37 token information: the URI for KIP-37 metadata.
            </p>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md="8">
                <InputField
                  label="URI"
                  type="text"
                  name="uri"
                  placeholder="URI (e.g., https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/3.json)"
                  value={uri}
                  onChange={(e) => this.onInputChange(e)}
                />
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <Button
                  disabled={deployButtonDisabled}
                  onClick={(e) => this.deploy(e)}
                >
                  Deploy
                </Button>
              </Col>
            </Row>
            {deployMsgVisible && (
              <Row>
                <Col md="8">
                  {deployMsg !== '' && deploySuccess === false && (
                    <CardText style={{ color: '#c221a9' }}>
                      {' '}
                      {deployMsg}{' '}
                    </CardText>
                  )}
                  {deployMsg !== '' && deploySuccess === true && (
                    <CardText>
                      {deployMsg}You can check it here :{' '}
                      <a
                        href={
                          networkLinks[network]['finderNFT'] + contractAddress
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        KIP-37 Token Address
                      </a>
                    </CardText>
                  )}
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>
        {deploySuccess && (
          <Card>
            <CardHeader>
              <h3 className="title">Create the KIP-37 Token</h3>
              <p style={{ color: '#6c757d' }}>
                Enter the new KIP-37 Token's initial supply and the token uri.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <InputField
                    label="Initial Supply"
                    type="text"
                    name="initialSupply"
                    placeholder="Initial Supply (e.g., 5)"
                    value={initialSupply}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <InputField
                    label="Token URI"
                    type="text"
                    name="tokenURI"
                    placeholder="Token URI (e.g., http://www.wenyou.com/image/SC-01%20SCISSORS.JPG)"
                    value={tokenURI}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <Button
                    disabled={createButtonDisabled}
                    onClick={(e) => this.create(e)}
                  >
                    Create
                  </Button>
                </Col>
              </Row>
              {createMsgVisible && (
                <Row>
                  <Col md="8">
                    {createMsg !== '' && createSuccess === false && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {createMsg}{' '}
                      </CardText>
                    )}
                    {createMsg !== '' && createSuccess === true && (
                      <CardText>
                        {createMsg} You can check it here :{' '}
                        <a
                          href={
                            networkLinks[network]['finderNFT'] +
                            contractAddress +
                            '?tabId=nftInventory&search=' +
                            senderAddress
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          KIP-37 Token Inventory
                        </a>
                      </CardText>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        )}
        {createSuccess && (
          <Card>
            <CardHeader>
              <h3 className="title">Mint the KIP-37 Token</h3>
              <p style={{ color: '#6c757d' }}>
                Enter the recipient's address who will receive the newly minted
                KIP-37 token and the number of tokens.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <InputField
                    label="Recipient's Address"
                    type="text"
                    name="recipientAddress"
                    placeholder="Recipient Address (e.g., 0x6CEe3d8c038ab74E2854C158d7B1b55544E814C8)"
                    value={recipientAddress}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <InputField
                    label="Token Amount"
                    type="text"
                    name="tokenAmount"
                    placeholder="Token Amount (e.g., 3)"
                    value={tokenAmount}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <Button
                    disabled={mintButtonDisabled}
                    onClick={(e) => this.mint(e)}
                  >
                    Mint
                  </Button>
                </Col>
              </Row>
              {mintMsgVisible && (
                <Row>
                  <Col md="8">
                    {mintMsg !== '' && mintSuccess === false && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {mintMsg}{' '}
                      </CardText>
                    )}
                    {mintMsg !== '' && mintSuccess === true && (
                      <CardText>
                        {mintMsg} You can check it here :{' '}
                        <a
                          href={
                            networkLinks[network]['finderNFT'] +
                            contractAddress +
                            '?tabId=nftInventory&search=' +
                            recipientAddress
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          KIP-37 Token Inventory
                        </a>
                      </CardText>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        )}
      </Column>
    )
  }
}

export default KIP37Deploy
