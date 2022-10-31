import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Keystore } from 'caver-js'
import styled from 'styled-components'
import _ from 'lodash'

import { URLMAP, UTIL } from 'consts'
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
  FormGroup,
  FormInput,
  FormSelect,
  CopyButton,
} from 'components'
import FormFile from 'components/FormFile'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

type NetworkType = 'mainnet' | 'testnet'

const KIP17Deploy = (): ReactElement => {
  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [senderAddress, setSenderAddress] = useState('')
  const [senderKeystoreJSON, setSenderKeystoreJSON] = useState<Keystore>()
  const [senderKeystorePassword, setSenderKeystorePassword] = useState('')
  const [senderDecryptMessage, setSenderDecryptMessage] = useState('')
  const [senderDecryptMessageVisible, setSenderDecryptMessageVisible] =
    useState(false)
  const [deployMsg, setDeployMsg] = useState('')
  const [deployMsgVisible, setDeployMsgVisible] = useState(false)
  const [deployButtonDisabled, setDeployButtonDisabled] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [nftReceiver, setNftReceiver] = useState('')
  const [tokenURI, setTokenURI] = useState('')
  const [mintMsg, setMintMsg] = useState('')
  const [mintMsgVisible, setMintMsgVisible] = useState(false)
  const [mintButtonDisabled, setMintButtonDisabled] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [lastTokenId, setLastTokenId] = useState(0)
  const [transferTokenId, setTransferTokenId] = useState('')
  const [transferReceiver, setTransferReceiver] = useState('')
  const [transferMsg, setTransferMsg] = useState('')
  const [transferMsgVisible, setTransferMsgVisible] = useState(false)
  const [transferButtonDisabled, setTransferButtonDisabled] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [burnTokenId, setBurnTokenId] = useState('')
  const [burMsg, setBurnMsg] = useState('')
  const [burnMsgVisible, setBurnMsgVisible] = useState(false)
  const [burnButtonDisabled, setBurnButtonDisabled] = useState(false)
  const [burnSuccess, setBurnSuccess] = useState(false)
  const [pauseMsg, setPauseMsg] = useState('')
  const [pauseMsgVisible, setPauseMsgVisible] = useState(false)
  const [pauseButtonDisabled, setPauseButtonDisabled] = useState(false)
  const [pauseSuccess, setPauseSuccess] = useState(false)
  const [unpauseMsg, setUnpauseMsg] = useState('')
  const [unpauseMsgVisible, setUnpauseMsgVisible] = useState(false)
  const [unpauseButtonDisabled, setUnpauseButtonDisabled] = useState(false)
  const [unpauseSuccess, setUnpauseSuccess] = useState(false)

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const handleSenderKeystoreChange = (files?: FileList) => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setSenderKeystoreJSON(json)
        }
      }
    }
  }

  const decryptSenderKeystore = () => {
    try {
      if (senderKeystoreJSON) {
        const keyring = caver.wallet.keyring.decrypt(
          senderKeystoreJSON,
          senderKeystorePassword
        )

        if (caver.wallet.isExisted(keyring.address)) {
          caver.wallet.updateKeyring(keyring)
        } else {
          caver.wallet.add(keyring)
        }

        setSenderDecryptMessage('Decryption succeeds!')
        setSenderAddress(keyring.address)
        setSenderDecryptMessageVisible(true)

        setTimeout(() => {
          setSenderDecryptMessageVisible(false)
          setSenderDecryptMessage('')
        }, 5000)
      }
    } catch (e: any) {
      setSenderDecryptMessage(e.toString())
      setSenderDecryptMessageVisible(true)
      setSenderAddress('')

      setTimeout(() => {
        setSenderDecryptMessageVisible(false)
        setSenderDecryptMessage('')
      }, 5000)
    }
  }

  const deploy = async () => {
    try {
      if (senderAddress === '') {
        throw Error('Sender Keystore is not uploaded!')
      }

      setDeployButtonDisabled(true)
      const kip17 = await caver.kct.kip17.deploy(
        {
          name: tokenName,
          symbol: tokenSymbol,
        },
        { from: senderAddress }
      )

      setDeployMsgVisible(true)
      setDeployMsg('KIP-17 smart contract is successfully deployed! ')
      setDeployButtonDisabled(false)
      setContractAddress(kip17.options.address)
      setDeploySuccess(true)
    } catch (e: any) {
      setDeployMsg(e.toString())
      setDeployMsgVisible(true)
      setDeployButtonDisabled(false)
      setContractAddress('')
      setDeploySuccess(false)

      setTimeout(() => {
        setDeployMsgVisible(false)
        setDeployMsg('')
      }, 5000)
    }
  }

  // mint = async (e) => {
  //   const {
  //     contractAddress,
  //     senderAddress,
  //     nftReceiver,
  //     tokenURI,
  //     lastTokenId,
  //   } = this.state
  //   try {
  //     this.setState({
  //       mintButtonDisabled: true,
  //     })

  //     const deployedContract = new caver.kct.kip17(contractAddress)
  //     deployedContract.options.from = senderAddress
  //     const currentTokenId = lastTokenId
  //     const minted = await deployedContract.mintWithTokenURI(
  //       nftReceiver,
  //       currentTokenId,
  //       tokenURI
  //     )
  //     const newMintMsg =
  //       'NFT(token ID: ' + currentTokenId + ') is successfully minted!'

  //     if (minted) {
  //       this.setState({
  //         mintMsgVisible: true,
  //         mintMsg: newMintMsg,
  //         mintButtonDisabled: false,
  //         mintSuccess: true,
  //         lastTokenId: currentTokenId + 1,
  //       })
  //     } else {
  //       throw Error('Minting is failed')
  //     }
  //   } catch (e) {
  //     this.setState({
  //       mintMsg: e.toString(),
  //       mintMsgVisible: true,
  //       mintButtonDisabled: false,
  //       nftReceiver: '',
  //       tokenURI: '',
  //       mintSuccess: false,
  //     })

  //     setTimeout(() => {
  //       this.setState({
  //         mintMsgVisible: false,
  //         mintMsg: '',
  //       })
  //     }, 5000)
  //   }
  // }

  // burn = async (e) => {
  //   const { contractAddress, senderAddress, burnTokenId } = this.state
  //   try {
  //     this.setState({
  //       burnButtonDisabled: true,
  //     })

  //     const deployedContract = new caver.kct.kip17(contractAddress)
  //     deployedContract.options.from = senderAddress
  //     const burned = await deployedContract.burn(BigNumber(burnTokenId))
  //     const newBurnMsg =
  //       'NFT(token ID: ' + burnTokenId + ') is successfully burned!'

  //     if (burned) {
  //       this.setState({
  //         burnMsgVisible: true,
  //         burnMsg: newBurnMsg,
  //         burnButtonDisabled: false,
  //         burnSuccess: true,
  //       })
  //     } else {
  //       throw Error('Burning is failed')
  //     }
  //   } catch (e) {
  //     this.setState({
  //       burnMsg: e.toString(),
  //       burnMsgVisible: true,
  //       burnButtonDisabled: false,
  //       burnTokenId: '',
  //       burnSuccess: false,
  //     })

  //     setTimeout(() => {
  //       this.setState({
  //         burnMsgVisible: false,
  //         burnMsg: '',
  //       })
  //     }, 5000)
  //   }
  // }

  // transfer = async (e) => {
  //   const {
  //     contractAddress,
  //     senderAddress,
  //     transferTokenId,
  //     transferReceiver,
  //   } = this.state
  //   try {
  //     this.setState({
  //       transferButtonDisabled: true,
  //     })

  //     const deployedContract = new caver.kct.kip17(contractAddress)
  //     deployedContract.options.from = senderAddress
  //     const transferred = await deployedContract.safeTransferFrom(
  //       senderAddress,
  //       transferReceiver,
  //       transferTokenId
  //     )
  //     const newTransferMsg =
  //       'NFT(token ID: ' + transferTokenId + ') is successfully transferred!'

  //     if (transferred) {
  //       this.setState({
  //         transferMsgVisible: true,
  //         transferMsg: newTransferMsg,
  //         transferButtonDisabled: false,
  //         transferSuccess: true,
  //       })
  //     } else {
  //       throw Error('Transferring is failed')
  //     }
  //   } catch (e) {
  //     this.setState({
  //       transferMsg: e.toString(),
  //       transferMsgVisible: true,
  //       transferButtonDisabled: false,
  //       transferTokenId: '',
  //       transferReceiver: '',
  //       transferSuccess: false,
  //     })

  //     setTimeout(() => {
  //       this.setState({
  //         transferMsgVisible: false,
  //         transferMsg: '',
  //       })
  //     }, 5000)
  //   }
  // }

  // pause = async (e) => {
  //   const { contractAddress, senderAddress } = this.state
  //   try {
  //     this.setState({
  //       pauseButtonDisabled: true,
  //     })

  //     const deployedContract = new caver.kct.kip17(contractAddress)
  //     deployedContract.options.from = senderAddress
  //     await deployedContract.pause()
  //     const paused = await deployedContract.paused()

  //     if (paused) {
  //       this.setState({
  //         pauseMsgVisible: true,
  //         pauseMsg: 'The KIP-17 token smart contract is successfully paused.',
  //         pauseButtonDisabled: false,
  //         pauseSuccess: true,
  //       })

  //       setTimeout(() => {
  //         this.setState({
  //           pauseMsgVisible: false,
  //           pauseMsg: '',
  //         })
  //       }, 4000)
  //     } else {
  //       throw Error('Pausing is failed')
  //     }
  //   } catch (e) {
  //     this.setState({
  //       pauseMsg: e.toString(),
  //       pauseMsgVisible: true,
  //       pauseButtonDisabled: false,
  //       pauseSuccess: false,
  //     })

  //     setTimeout(() => {
  //       this.setState({
  //         pauseMsgVisible: false,
  //         pauseMsg: '',
  //       })
  //     }, 4000)
  //   }
  // }

  // unpause = async (e) => {
  //   const { contractAddress, senderAddress } = this.state
  //   try {
  //     this.setState({
  //       unpauseButtonDisabled: true,
  //     })

  //     const deployedContract = new caver.kct.kip17(contractAddress)
  //     deployedContract.options.from = senderAddress
  //     await deployedContract.unpause()
  //     const paused = await deployedContract.paused()

  //     if (!paused) {
  //       this.setState({
  //         unpauseMsgVisible: true,
  //         unpauseMsg:
  //           'The KIP-17 token smart contract is successfully resumed.',
  //         unpauseButtonDisabled: false,
  //         unpauseSuccess: true,
  //         pauseSuccess: false,
  //       })

  //       setTimeout(() => {
  //         this.setState({
  //           unpauseMsgVisible: false,
  //           unpauseMsg: '',
  //         })
  //       }, 4000)
  //     } else {
  //       throw Error('Unpausing is failed')
  //     }
  //   } catch (e) {
  //     this.setState({
  //       unpauseMsg: e.toString(),
  //       unpauseMsgVisible: true,
  //       unpauseButtonDisabled: false,
  //       unpauseSuccess: false,
  //     })

  //     setTimeout(() => {
  //       this.setState({
  //         unpauseMsgVisible: false,
  //         unpauseMsg: '',
  //       })
  //     }, 4000)
  //   }
  // }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Deploy KIP-17 Non-fungible Token (NFT)</h3>
          <Text>
            Here you can deploy a KIP-17 smart contract to the Klaytn Cypress or
            Baobab network. Please refer to{' '}
            <a href="https://kips.klaytn.foundation/KIPs/kip-17">
              KIP-17: Non-fungible Token Standard
            </a>{' '}
            and{' '}
            <a href="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip17">
              caver.kct.kip17
            </a>
            .
          </Text>
        </CardHeader>
        <CardBody>
          <h3 className="title"> Upload Deployer Keystore File</h3>
          <Text>
            Upload the Keystore file. This account must have enough KLAY to
            deploy a KIP-17 smart contract.
          </Text>
          <StyledSection>
            <FormGroup>
              <Label>Network</Label>
              <FormSelect
                defaultValue={network}
                itemList={[
                  { value: 'mainnet', label: 'Mainnet' },
                  { value: 'testnet', label: 'Testnet' },
                ]}
                onChange={setNetwork}
              />
            </FormGroup>
          </StyledSection>
          <StyledSection>
            <Label>Keystore</Label>
            <FormFile
              placeholder="Keystore File"
              accept=".json"
              onChange={handleSenderKeystoreChange}
            />
          </StyledSection>
          <StyledSection>
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setSenderKeystorePassword}
              value={senderKeystorePassword}
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={decryptSenderKeystore}>Decrypt</Button>
          </StyledSection>
          {senderDecryptMessageVisible && (
            <StyledSection>
              <Text style={{ color: '#c221a9' }}>{senderDecryptMessage}</Text>
            </StyledSection>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="title">Non-fungible Token (NFT) Information</h3>
          <Text>
            Enter the Non-fungible token (NFT) information: the NFT's name and
            symbol.
          </Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>NFT Name</Label>
            <FormInput
              type="text"
              placeholder="NFT Name (e.g., KlaytnEverywhere)"
              onChange={setTokenName}
              value={tokenName}
            />
          </StyledSection>
          <StyledSection>
            <Label>NFT Symbol</Label>
            <FormInput
              type="text"
              placeholder="NFT Symbol (e.g., KEW)"
              onChange={setTokenSymbol}
              value={tokenSymbol}
            />
          </StyledSection>
          <StyledSection>
            <Button disabled={deployButtonDisabled} onClick={deploy}>
              Deploy
            </Button>
          </StyledSection>
          {deployMsgVisible && (
            <StyledSection>
              {deployMsg !== '' && !deploySuccess && (
                <Text style={{ color: '#c221a9' }}>{deployMsg}</Text>
              )}
              {deployMsg !== '' && deploySuccess && (
                <Text>
                  {deployMsg}You can check it below link:
                  <br />
                  <a
                    href={
                      URLMAP.network[network]['finderNFT'] + contractAddress
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    NFT Address
                  </a>
                </Text>
              )}
            </StyledSection>
          )}
        </CardBody>
      </Card>
      {/* {deploySuccess && (
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
      )} */}
    </Column>
  )
}

export default KIP17Deploy
