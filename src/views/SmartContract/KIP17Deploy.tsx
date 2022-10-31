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
  const [deployButtonDisabled, setDeployButtonDisabled] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [nftReceiver, setNftReceiver] = useState('')
  const [tokenURI, setTokenURI] = useState('')
  const [mintMsg, setMintMsg] = useState('')
  const [mintButtonDisabled, setMintButtonDisabled] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [lastTokenId, setLastTokenId] = useState(0)
  const [transferTokenId, setTransferTokenId] = useState('')
  const [transferReceiver, setTransferReceiver] = useState('')
  const [transferMsg, setTransferMsg] = useState('')
  const [transferButtonDisabled, setTransferButtonDisabled] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [burnTokenId, setBurnTokenId] = useState('')
  const [burnMsg, setBurnMsg] = useState('')
  const [burnButtonDisabled, setBurnButtonDisabled] = useState(false)
  const [burnSuccess, setBurnSuccess] = useState(false)
  const [pauseMsg, setPauseMsg] = useState('')
  const [pauseButtonDisabled, setPauseButtonDisabled] = useState(false)
  const [pauseSuccess, setPauseSuccess] = useState(false)
  const [unpauseMsg, setUnpauseMsg] = useState('')
  const [unpauseButtonDisabled, setUnpauseButtonDisabled] = useState(false)
  const [unpauseSuccess, setUnpauseSuccess] = useState(false)

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const exTokenURI = 'https://cryptologos.cc/logos/klaytn-klay-logo.svg?v=023'

  const exTokenReceiver = '0x6CEe3d8c038ab74E2854C158d7B1b55544E814C8'

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

      setDeployMsg('KIP-17 smart contract is successfully deployed! ')
      setDeployButtonDisabled(false)
      setContractAddress(kip17.options.address)
      setDeploySuccess(true)
    } catch (e: any) {
      setDeployMsg(e.toString())
      setDeployButtonDisabled(false)
      setContractAddress('')
      setDeploySuccess(false)

      setTimeout(() => {
        setDeployMsg('')
      }, 5000)
    }
  }

  const mint = async () => {
    try {
      setMintButtonDisabled(true)

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
        setMintMsg(newMintMsg)
        setMintButtonDisabled(false)
        setMintSuccess(true)
        setLastTokenId(currentTokenId + 1)
      } else {
        throw Error('Minting is failed')
      }
    } catch (e: any) {
      setMintMsg(e.toString())
      setMintButtonDisabled(false)
      setNftReceiver('')
      setTokenURI('')
      setMintSuccess(false)

      setTimeout(() => {
        setMintMsg('')
      }, 5000)
    }
  }

  const burn = async () => {
    try {
      setBurnButtonDisabled(true)

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const burned = await deployedContract.burn(burnTokenId)
      const newBurnMsg =
        'NFT(token ID: ' + burnTokenId + ') is successfully burned!'

      if (burned) {
        setBurnMsg(newBurnMsg)
        setBurnButtonDisabled(false)
        setBurnSuccess(true)
      } else {
        throw Error('Burning is failed')
      }
    } catch (e: any) {
      setBurnMsg(e.toString())
      setBurnButtonDisabled(false)
      setBurnTokenId('')
      setBurnSuccess(false)

      setTimeout(() => {
        setBurnMsg('')
      }, 5000)
    }
  }

  const transfer = async () => {
    try {
      setTransferButtonDisabled(true)

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
        setTransferMsg(newTransferMsg)
        setTransferButtonDisabled(false)
        setTransferSuccess(true)
      } else {
        throw Error('Transferring is failed')
      }
    } catch (e: any) {
      setTransferMsg(e.toString())
      setTransferButtonDisabled(false)
      setTransferTokenId('')
      setTransferReceiver('')
      setTransferSuccess(false)

      setTimeout(() => {
        setTransferMsg('')
      }, 5000)
    }
  }

  const pause = async () => {
    try {
      setPauseButtonDisabled(true)

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      await deployedContract.pause()
      const paused = await deployedContract.paused()

      if (paused) {
        setPauseMsg('The KIP-17 token smart contract is successfully paused.')
        setPauseButtonDisabled(false)
        setPauseSuccess(true)

        setTimeout(() => {
          setPauseMsg('')
        }, 4000)
      } else {
        throw Error('Pausing is failed')
      }
    } catch (e: any) {
      setPauseMsg(e.toString())
      setPauseButtonDisabled(false)
      setPauseSuccess(false)

      setTimeout(() => {
        setPauseMsg('')
      }, 4000)
    }
  }

  const unpause = async () => {
    try {
      setUnpauseButtonDisabled(true)

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      await deployedContract.unpause()
      const paused = await deployedContract.paused()

      if (!paused) {
        setUnpauseMsg(
          'The KIP-17 token smart contract is successfully resumed.'
        )
        setUnpauseButtonDisabled(false)
        setUnpauseSuccess(true)
        setPauseSuccess(false)

        setTimeout(() => {
          setUnpauseMsg('')
        }, 4000)
      } else {
        throw Error('Unpausing is failed')
      }
    } catch (e: any) {
      setUnpauseMsg(e.toString())
      setUnpauseButtonDisabled(false)
      setUnpauseSuccess(false)

      setTimeout(() => {
        setUnpauseMsg('')
      }, 4000)
    }
  }

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
          {!!deployMsg && (
            <StyledSection>
              {deploySuccess ? (
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
              ) : (
                <Text style={{ color: '#c221a9' }}>{deployMsg}</Text>
              )}
            </StyledSection>
          )}
        </CardBody>
      </Card>
      {deploySuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Mint the Non-fungible Token (NFT)</h3>
            <Text>
              Enter the NFT's receiver and token URI for the image file's
              location.
            </Text>
          </CardHeader>
          <CardBody>
            <StyledSection>
              <Label>NFT Receiver</Label>
              <FormInput
                type="text"
                placeholder="Receiver's address"
                onChange={setNftReceiver}
                value={nftReceiver}
              />
            </StyledSection>
            <StyledSection>
              <Label>Token URI</Label>
              <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text>{`Ex :\n${exTokenURI}`}</Text>
                <View style={{ gap: 4 }}>
                  <Button
                    size="sm"
                    onClick={(): void => {
                      setTokenURI(exTokenURI)
                    }}
                  >
                    Try
                  </Button>
                  <CopyButton text={exTokenURI} buttonProps={{ size: 'sm' }}>
                    Copy
                  </CopyButton>
                </View>
              </Row>
              <FormInput
                type="text"
                placeholder="Token URI"
                onChange={setTokenURI}
                value={tokenURI}
              />
            </StyledSection>
            <StyledSection>
              <Button disabled={mintButtonDisabled} onClick={mint}>
                Mint
              </Button>
            </StyledSection>
            {!!mintMsg && (
              <StyledSection>
                {mintSuccess ? (
                  <Text>
                    {mintMsg} You can check it below link:
                    <br />
                    <a
                      href={
                        URLMAP.network[network]['finderNFT'] +
                        contractAddress +
                        '?tabId=nftInventory&search=' +
                        nftReceiver
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      NFT Inventory
                    </a>
                  </Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}>{mintMsg}</Text>
                )}
              </StyledSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Burn the Non-fungible Token (NFT)</h3>
            <Text>Enter the token Id you own and want to burn.</Text>
          </CardHeader>
          <CardBody>
            <StyledSection>
              <Label>Burn Token Id</Label>
              <FormInput
                type="text"
                placeholder="NFT TokenId you own"
                onChange={setBurnTokenId}
                value={burnTokenId}
              />
            </StyledSection>
            <StyledSection>
              <Button disabled={burnButtonDisabled} onClick={burn}>
                Burn
              </Button>
            </StyledSection>
            {!!burnMsg && (
              <StyledSection>
                {burnSuccess ? (
                  <Text>
                    {burnMsg} You can see that the NFT you just removed no
                    longer exists:{' '}
                    <a
                      href={
                        URLMAP.network[network]['finderNFT'] +
                        contractAddress +
                        '?tabId=nftInventory&search=' +
                        senderAddress
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      NFT Inventory
                    </a>
                  </Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}> {burnMsg} </Text>
                )}
              </StyledSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Send the Non-fungible Token (NFT)</h3>
            <Text>Enter the token Id you own and want to transfer.</Text>
          </CardHeader>
          <CardBody>
            <StyledSection>
              <Label>Transfer Receiver</Label>
              <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text>{`Ex :\n${exTokenReceiver}`}</Text>
                <View style={{ gap: 4 }}>
                  <Button
                    size="sm"
                    onClick={(): void => {
                      setTransferReceiver(exTokenReceiver)
                    }}
                  >
                    Try
                  </Button>
                  <CopyButton
                    text={exTokenReceiver}
                    buttonProps={{ size: 'sm' }}
                  >
                    Copy
                  </CopyButton>
                </View>
              </Row>
              <FormInput
                type="text"
                placeholder="The address of the receiver"
                onChange={setTransferReceiver}
                value={transferReceiver}
              />
            </StyledSection>

            <StyledSection>
              <Label>Transfer Token Id</Label>
              <FormInput
                type="text"
                placeholder="NFT TokenId you own"
                onChange={setTransferTokenId}
                value={transferTokenId}
              />
            </StyledSection>
            <StyledSection>
              <Button disabled={transferButtonDisabled} onClick={transfer}>
                Transfer
              </Button>
            </StyledSection>
            {!!transferMsg && (
              <StyledSection>
                {transferSuccess ? (
                  <Text>
                    {transferMsg} You can see that the NFT you just sent:{' '}
                    <a
                      href={
                        URLMAP.network[network]['finderNFT'] +
                        contractAddress +
                        '?tabId=nftInventory&search=' +
                        transferReceiver
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      NFT Inventory
                    </a>
                  </Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}>{transferMsg}</Text>
                )}
              </StyledSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && !pauseSuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Pause the KIP-17 Token Smart Contract</h3>
            <Text>You can suspend functions related to sending tokens.</Text>
          </CardHeader>
          <CardBody>
            <StyledSection>
              <Button disabled={pauseButtonDisabled} onClick={pause}>
                Pause
              </Button>
            </StyledSection>
            {!!unpauseMsg && (
              <StyledSection>
                {unpauseSuccess ? (
                  <Text>{unpauseMsg}</Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}>{unpauseMsg}</Text>
                )}
              </StyledSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && pauseSuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Unpause the KIP-17 Token Smart Contract</h3>
            <Text>You can resume the paused contract.</Text>
          </CardHeader>
          <CardBody>
            <StyledSection>
              <Button disabled={unpauseButtonDisabled} onClick={unpause}>
                Unpause
              </Button>
            </StyledSection>
            {pauseMsg && (
              <StyledSection>
                {pauseSuccess ? (
                  <Text>{pauseMsg}</Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}>{pauseMsg}</Text>
                )}
              </StyledSection>
            )}
          </CardBody>
        </Card>
      )}
    </Column>
  )
}

export default KIP17Deploy
