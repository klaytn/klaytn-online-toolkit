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

class KIP17Deploy extends Component {
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
      tokenName: '',
      tokenSymbol: '',
      contractAddress: '',
      nftReceiver: '',
      tokenURI: '',
      mintMsg: null,
      mintMsgVisible: false,
      mintButtonDisabled: false,
      mintSuccess: false,
      lastTokenId: 0,
      transferTokenId: '',
      transferReceiver: '',
      transferMsg: null,
      transferMsgVisible: false,
      transferButtonDisabled: false,
      transferSuccess: false,
      burnTokenId: '',
      burnMsg: null,
      burnMsgVisible: false,
      burnButtonDisabled: false,
      burnSuccess: false,
      pauseMsg: null,
      pauseMsgVisible: false,
      pauseButtonDisabled: false,
      pauseSuccess: false,
      unpauseMsg: null,
      unpauseMsgVisible: false,
      unpauseButtonDisabled: false,
      unpauseSuccess: false,
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
    const { senderAddress, tokenName, tokenSymbol } = this.state
    try {
      if (senderAddress === '') {
        throw Error('Sender Keystore is not uploaded!')
      }

      this.setState({
        deployButtonDisabled: true,
      })

      const kip17 = await caver.kct.kip17.deploy(
        {
          name: tokenName,
          symbol: tokenSymbol,
        },
        { from: senderAddress }
      )

      this.setState({
        deployMsgVisible: true,
        deployMsg: `KIP-17 smart contract is successfully deployed! `,
        deployButtonDisabled: false,
        contractAddress: kip17.options.address,
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

  mint = async (e) => {
    const {
      contractAddress,
      senderAddress,
      nftReceiver,
      tokenURI,
      lastTokenId,
    } = this.state
    try {
      this.setState({
        mintButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const currentTokenId = lastTokenId
      const minted = await deployedContract.mintWithTokenURI(
        nftReceiver,
        currentTokenId,
        tokenURI
      )
      const newMintMsg =
        'NFT(token ID: ' + currentTokenId + ') is successfully minted!'

      if (minted) {
        this.setState({
          mintMsgVisible: true,
          mintMsg: newMintMsg,
          mintButtonDisabled: false,
          mintSuccess: true,
          lastTokenId: currentTokenId + 1,
        })
      } else {
        throw Error('Minting is failed')
      }
    } catch (e) {
      this.setState({
        mintMsg: e.toString(),
        mintMsgVisible: true,
        mintButtonDisabled: false,
        nftReceiver: '',
        tokenURI: '',
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

  burn = async (e) => {
    const { contractAddress, senderAddress, burnTokenId } = this.state
    try {
      this.setState({
        burnButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const burned = await deployedContract.burn(BigNumber(burnTokenId))
      const newBurnMsg =
        'NFT(token ID: ' + burnTokenId + ') is successfully burned!'

      if (burned) {
        this.setState({
          burnMsgVisible: true,
          burnMsg: newBurnMsg,
          burnButtonDisabled: false,
          burnSuccess: true,
        })
      } else {
        throw Error('Burning is failed')
      }
    } catch (e) {
      this.setState({
        burnMsg: e.toString(),
        burnMsgVisible: true,
        burnButtonDisabled: false,
        burnTokenId: '',
        burnSuccess: false,
      })

      setTimeout(() => {
        this.setState({
          burnMsgVisible: false,
          burnMsg: '',
        })
      }, 5000)
    }
  }

  transfer = async (e) => {
    const {
      contractAddress,
      senderAddress,
      transferTokenId,
      transferReceiver,
    } = this.state
    try {
      this.setState({
        transferButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const transferred = await deployedContract.safeTransferFrom(
        senderAddress,
        transferReceiver,
        transferTokenId
      )
      const newTransferMsg =
        'NFT(token ID: ' + transferTokenId + ') is successfully transferred!'

      if (transferred) {
        this.setState({
          transferMsgVisible: true,
          transferMsg: newTransferMsg,
          transferButtonDisabled: false,
          transferSuccess: true,
        })
      } else {
        throw Error('Transferring is failed')
      }
    } catch (e) {
      this.setState({
        transferMsg: e.toString(),
        transferMsgVisible: true,
        transferButtonDisabled: false,
        transferTokenId: '',
        transferReceiver: '',
        transferSuccess: false,
      })

      setTimeout(() => {
        this.setState({
          transferMsgVisible: false,
          transferMsg: '',
        })
      }, 5000)
    }
  }

  pause = async (e) => {
    const { contractAddress, senderAddress } = this.state
    try {
      this.setState({
        pauseButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      await deployedContract.pause()
      const paused = await deployedContract.paused()

      if (paused) {
        this.setState({
          pauseMsgVisible: true,
          pauseMsg: 'The KIP-17 token smart contract is successfully paused.',
          pauseButtonDisabled: false,
          pauseSuccess: true,
        })

        setTimeout(() => {
          this.setState({
            pauseMsgVisible: false,
            pauseMsg: '',
          })
        }, 4000)
      } else {
        throw Error('Pausing is failed')
      }
    } catch (e) {
      this.setState({
        pauseMsg: e.toString(),
        pauseMsgVisible: true,
        pauseButtonDisabled: false,
        pauseSuccess: false,
      })

      setTimeout(() => {
        this.setState({
          pauseMsgVisible: false,
          pauseMsg: '',
        })
      }, 4000)
    }
  }

  unpause = async (e) => {
    const { contractAddress, senderAddress } = this.state
    try {
      this.setState({
        unpauseButtonDisabled: true,
      })

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      await deployedContract.unpause()
      const paused = await deployedContract.paused()

      if (!paused) {
        this.setState({
          unpauseMsgVisible: true,
          unpauseMsg:
            'The KIP-17 token smart contract is successfully resumed.',
          unpauseButtonDisabled: false,
          unpauseSuccess: true,
          pauseSuccess: false,
        })

        setTimeout(() => {
          this.setState({
            unpauseMsgVisible: false,
            unpauseMsg: '',
          })
        }, 4000)
      } else {
        throw Error('Unpausing is failed')
      }
    } catch (e) {
      this.setState({
        unpauseMsg: e.toString(),
        unpauseMsgVisible: true,
        unpauseButtonDisabled: false,
        unpauseSuccess: false,
      })

      setTimeout(() => {
        this.setState({
          unpauseMsgVisible: false,
          unpauseMsg: '',
        })
      }, 4000)
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
      tokenName,
      tokenSymbol,
      nftReceiver,
      tokenURI,
      mintMsg,
      mintMsgVisible,
      mintButtonDisabled,
      mintSuccess,
      senderAddress,
      transferTokenId,
      transferReceiver,
      transferMsg,
      transferMsgVisible,
      transferButtonDisabled,
      transferSuccess,
      burnTokenId,
      burnMsg,
      burnMsgVisible,
      burnButtonDisabled,
      burnSuccess,
      pauseMsg,
      pauseMsgVisible,
      pauseButtonDisabled,
      pauseSuccess,
      unpauseMsg,
      unpauseMsgVisible,
      unpauseButtonDisabled,
      unpauseSuccess,
    } = this.state
    return (
      <Column>
        <Card>
          <CardHeader>
            <h3 className="title">Deploy KIP-17 Non-fungible Token (NFT)</h3>
            <p style={{ color: '#6c757d' }}>
              Here you can deploy a KIP-17 smart contract to the Klaytn Cypress
              or Baobab network. Please refer to{' '}
              <a href="https://kips.klaytn.foundation/KIPs/kip-17">
                KIP-17: Non-fungible Token Standard
              </a>{' '}
              and{' '}
              <a href="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip17">
                caver.kct.kip17
              </a>
              .
            </p>
          </CardHeader>
          <CardBody>
            <h3 className="title"> Upload Deployer Keystore File</h3>
            <p style={{ color: '#6c757d' }}>
              Upload the Keystore file. This account must have enough KLAY to
              deploy a KIP-17 smart contract.
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
            <h3 className="title">Non-fungible Token (NFT) Information</h3>
            <p style={{ color: '#6c757d' }}>
              Enter the Non-fungible token (NFT) information: the NFT's name and
              symbol.
            </p>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md="8">
                <InputField
                  label="NFT Name"
                  type="text"
                  name="tokenName"
                  placeholder="NFT Name (e.g., KlaytnEverywhere)"
                  value={tokenName}
                  onChange={(e) => this.onInputChange(e)}
                />
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <InputField
                  label="NFT Symbol"
                  type="text"
                  name="tokenSymbol"
                  placeholder="NFT Symbol (e.g., KEW)"
                  value={tokenSymbol}
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
                  {deployMsg !== '' && !deploySuccess && (
                    <CardText style={{ color: '#c221a9' }}>
                      {' '}
                      {deployMsg}{' '}
                    </CardText>
                  )}
                  {deployMsg !== '' && deploySuccess && (
                    <CardText>
                      {deployMsg}You can check it here :{' '}
                      <a
                        href={
                          networkLinks[network]['finderNFT'] + contractAddress
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        NFT Address
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
              <h3 className="title">Mint the Non-fungible Token (NFT)</h3>
              <p style={{ color: '#6c757d' }}>
                Enter the NFT's receiver and token URI for the image file's
                location.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <InputField
                    label="NFT Receiver"
                    type="text"
                    name="nftReceiver"
                    placeholder="Receiver's address"
                    value={nftReceiver}
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
                    placeholder="Token URI (e.g., https://cryptologos.cc/logos/klaytn-klay-logo.svg?v=023)"
                    value={tokenURI}
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
                    {mintMsg !== '' && !mintSuccess && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {mintMsg}{' '}
                      </CardText>
                    )}
                    {mintMsg !== '' && mintSuccess && (
                      <CardText>
                        {mintMsg} You can check it here:{' '}
                        <a
                          href={
                            networkLinks[network]['finderNFT'] +
                            contractAddress +
                            '?tabId=nftInventory&search=' +
                            nftReceiver
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          NFT Inventory
                        </a>
                      </CardText>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        )}
        {mintSuccess && (
          <Card>
            <CardHeader>
              <h3 className="title">Burn the Non-fungible Token (NFT)</h3>
              <p style={{ color: '#6c757d' }}>
                Enter the token Id you own and want to burn.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <InputField
                    label="Burn Token Id"
                    type="text"
                    name="burnTokenId"
                    placeholder="NFT TokenId you own"
                    value={burnTokenId}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <Button
                    disabled={burnButtonDisabled}
                    onClick={(e) => this.burn(e)}
                  >
                    Burn
                  </Button>
                </Col>
              </Row>
              {burnMsgVisible && (
                <Row>
                  <Col md="8">
                    {burnMsg !== '' && !burnSuccess && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {burnMsg}{' '}
                      </CardText>
                    )}
                    {burnMsg !== '' && burnSuccess && (
                      <CardText>
                        {burnMsg} You can see that the NFT you just removed no
                        longer exists:{' '}
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
                          NFT Inventory
                        </a>
                      </CardText>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        )}
        {mintSuccess && (
          <Card>
            <CardHeader>
              <h3 className="title">Send the Non-fungible Token (NFT)</h3>
              <p style={{ color: '#6c757d' }}>
                Enter the token Id you own and want to transfer.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <InputField
                    label="Transfer Receiver"
                    type="text"
                    name="transferReceiver"
                    placeholder="The address of the receiver"
                    value={transferReceiver}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <InputField
                    label="Transfer Token Id"
                    type="text"
                    name="transferTokenId"
                    placeholder="NFT TokenId you own"
                    value={transferTokenId}
                    onChange={(e) => this.onInputChange(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <Button
                    disabled={transferButtonDisabled}
                    onClick={(e) => this.transfer(e)}
                  >
                    Transfer
                  </Button>
                </Col>
              </Row>
              {transferMsgVisible && (
                <Row>
                  <Col md="8">
                    {transferMsg !== '' && !transferSuccess && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {transferMsg}{' '}
                      </CardText>
                    )}
                    {transferMsg !== '' && transferSuccess && (
                      <CardText>
                        {transferMsg} You can see that the NFT you just sent:{' '}
                        <a
                          href={
                            networkLinks[network]['finderNFT'] +
                            contractAddress +
                            '?tabId=nftInventory&search=' +
                            transferReceiver
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          NFT Inventory
                        </a>
                      </CardText>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        )}
        {mintSuccess && !pauseSuccess && (
          <Card>
            <CardHeader>
              <h3 className="title">Pause the KIP-17 Token Smart Contract</h3>
              <p style={{ color: '#6c757d' }}>
                You can suspend functions related to sending tokens.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <Button
                    disabled={pauseButtonDisabled}
                    onClick={(e) => this.pause(e)}
                  >
                    Pause
                  </Button>
                </Col>
              </Row>
              {unpauseMsgVisible && (
                <Row>
                  <Col md="8">
                    {unpauseMsg !== '' && !unpauseSuccess && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {unpauseMsg}{' '}
                      </CardText>
                    )}
                    {unpauseMsg !== '' && unpauseSuccess && (
                      <CardText>{unpauseMsg}</CardText>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        )}
        {mintSuccess && pauseSuccess && (
          <Card>
            <CardHeader>
              <h3 className="title">Unpause the KIP-17 Token Smart Contract</h3>
              <p style={{ color: '#6c757d' }}>
                You can resume the paused contract.
              </p>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="8">
                  <Button
                    disabled={unpauseButtonDisabled}
                    onClick={(e) => this.unpause(e)}
                  >
                    Unpause
                  </Button>
                </Col>
              </Row>
              {pauseMsgVisible && (
                <Row>
                  <Col md="8">
                    {pauseMsg !== '' && !pauseSuccess && (
                      <CardText style={{ color: '#c221a9' }}>
                        {' '}
                        {pauseMsg}{' '}
                      </CardText>
                    )}
                    {pauseMsg !== '' && pauseSuccess && (
                      <CardText>{pauseMsg}</CardText>
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

export default KIP17Deploy
