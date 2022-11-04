import { ReactElement, useMemo, useState } from 'react'
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
  FormInput,
  FormSelect,
  CopyButton,
  CardSection,
  FormFile,
  CardExample,
} from 'components'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

type NetworkType = 'mainnet' | 'testnet'

const KIP37Deploy = (): ReactElement => {
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
  const [contractAddress, setContractAddress] = useState('')
  const [uri, setUri] = useState('')
  const [lastTokenId, setLastTokenId] = useState(0)
  const [initialSupply, setInitialSupply] = useState('')
  const [tokenURI, setTokenURI] = useState('')
  const [createMsg, setCreateMsg] = useState('')
  const [createButtonDisabled, setCreateButtonDisabled] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const [transferId, setTransferId] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferMsg, setTransferMsg] = useState('')
  const [transferButtonDisabled, setTransferButtonDisabled] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [mintMsg, setMintMsg] = useState('')
  const [mintButtonDisabled, setMintButtonDisabled] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const exURI =
    'https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/3.json'

  const exTokenURI = 'http://www.wenyou.com/image/SC-01%20SCISSORS.JPG'

  const exAddress = '0x6CEe3d8c038ab74E2854C158d7B1b55544E814C8'

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
      const kip37 = await caver.kct.kip37.deploy(
        {
          uri: uri,
        },
        { from: senderAddress }
      )

      setDeployMsg('KIP-37 smart contract is successfully deployed! ')
      setDeployButtonDisabled(false)
      setContractAddress(kip37.options.address)
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

  const create = async () => {
    try {
      setCreateButtonDisabled(true)

      const deployedContract = new caver.kct.kip37(contractAddress)
      deployedContract.options.from = senderAddress
      const currentTokenId = lastTokenId
      const created = await deployedContract.create(
        currentTokenId,
        initialSupply,
        tokenURI
      )
      const newCreateMsg = `KIP-37 Token(Token ID: ${currentTokenId}) is successfully created!`

      if (created) {
        setCreateMsg(newCreateMsg)
        setCreateButtonDisabled(false)
        setLastTokenId(currentTokenId + 1)
        setCreateSuccess(true)
      } else {
        throw Error('Creating is failed')
      }
    } catch (e: any) {
      setCreateMsg(e.toString())
      setCreateButtonDisabled(false)
      setInitialSupply('')
      setTokenURI('')
      setCreateSuccess(false)

      setTimeout(() => {
        setCreateMsg('')
      }, 5000)
    }
  }

  const transfer = async () => {
    try {
      setTransferButtonDisabled(true)

      const deployedContract = new caver.kct.kip37(contractAddress)
      deployedContract.options.from = senderAddress
      const balance = await deployedContract.balanceOf(
        senderAddress,
        transferId
      )

      const transferred = await deployedContract.safeTransferFrom(
        senderAddress,
        toAddress,
        transferId,
        transferAmount,
        'data'
      )

      let newTransferMsg
      if (transferAmount === '1') {
        newTransferMsg = `KIP-37 Token(Token ID: ${transferId}) is successfully transferred!`
      } else {
        newTransferMsg = `KIP-37 Tokens(Token ID: ${transferId}) are successfully transferred!`
      }

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
      setToAddress('')
      setTransferId('')
      setTransferAmount('')
      setTransferSuccess(false)

      setTimeout(() => {
        setTransferMsg('')
      }, 5000)
    }
  }

  const mint = async () => {
    try {
      setMintButtonDisabled(true)

      const deployedContract = new caver.kct.kip37(contractAddress)
      deployedContract.options.from = senderAddress
      const currentTokenId = lastTokenId - 1
      const minted = await deployedContract.mint(
        recipientAddress,
        currentTokenId,
        tokenAmount
      )
      const newMintMsg = `KIP-37 Token(Token ID: ${currentTokenId}) is successfully minted!`

      if (minted) {
        setMintMsg(newMintMsg)
        setMintButtonDisabled(false)
        setMintSuccess(true)
      } else {
        throw Error('Minting is failed')
      }
    } catch (e: any) {
      setMintMsg(e.toString())
      setMintButtonDisabled(false)
      setRecipientAddress('')
      setTokenAmount('')
      setMintSuccess(false)

      setTimeout(() => {
        setMintMsg('')
      }, 5000)
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Deploy KIP-37 Token</h3>
          <Text>
            Here you can deploy a KIP-37 smart contract to the Klaytn Cypress or
            Baobab network. Please refer to{' '}
            <a href="http://kips.klaytn.foundation/KIPs/kip-37">
              KIP-37: Token Standard
            </a>{' '}
            and{' '}
            <a href="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip37">
              caver.kct.kip37
            </a>
            .
          </Text>
        </CardHeader>
        <CardBody>
          <h3 className="title"> Upload Deployer Keystore File</h3>
          <Text>
            Upload the Keystore file. This account must have enough KLAY to
            deploy a KIP-37 smart contract.
          </Text>
          <CardSection>
            <Label>Network</Label>
            <FormSelect
              defaultValue={network}
              itemList={[
                { value: 'mainnet', label: 'Mainnet' },
                { value: 'testnet', label: 'Testnet' },
              ]}
              onChange={setNetwork}
              containerStyle={{ width: 200 }}
            />
          </CardSection>
          <CardSection>
            <Label>Keystore</Label>
            <FormFile
              placeholder="Keystore File"
              accept=".json"
              onChange={handleSenderKeystoreChange}
            />
          </CardSection>
          <CardSection>
            <Label>Password</Label>
            <FormInput
              type="password"
              placeholder="Password"
              onChange={setSenderKeystorePassword}
              value={senderKeystorePassword}
            />
          </CardSection>
          <CardSection>
            <Button onClick={decryptSenderKeystore}>Decrypt</Button>
          </CardSection>
          {senderDecryptMessageVisible && (
            <CardSection>
              <Text style={{ color: '#c221a9' }}>{senderDecryptMessage}</Text>
            </CardSection>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="title">KIP-37 Token Information</h3>
          <Text>
            Enter the KIP-37 token information: the URI for KIP-37 metadata.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>URI</Label>
            <CardExample exValue={exURI} onClickTry={setUri} />
            <FormInput
              type="text"
              placeholder="URI"
              onChange={setUri}
              value={uri}
            />
          </CardSection>
          <CardSection>
            <Button disabled={deployButtonDisabled} onClick={deploy}>
              Deploy
            </Button>
          </CardSection>
          {!!deployMsg && (
            <CardSection>
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
                    KIP-37 Token Address
                  </a>
                </Text>
              ) : (
                <Text style={{ color: '#c221a9' }}> {deployMsg} </Text>
              )}
            </CardSection>
          )}
        </CardBody>
      </Card>
      {deploySuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Create the KIP-37 Token</h3>
            <Text>
              Enter the new KIP-37 Token's initial supply and the token uri.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <Label>Initial Supply</Label>
              <FormInput
                type="text"
                placeholder="Initial Supply (e.g., 5)"
                onChange={setInitialSupply}
                value={initialSupply}
              />
            </CardSection>
            <CardSection>
              <Label>Token URI</Label>
              <CardExample exValue={exTokenURI} onClickTry={setTokenURI} />
              <FormInput
                type="text"
                placeholder="Token URI"
                onChange={setTokenURI}
                value={tokenURI}
              />
            </CardSection>
            <CardSection>
              <Button disabled={createButtonDisabled} onClick={create}>
                Create
              </Button>
            </CardSection>
            {!!createMsg && (
              <CardSection>
                {createSuccess ? (
                  <Text>
                    {createMsg} You can check it below link:
                    <br />
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
                      KIP-37 Token Inventory
                    </a>
                  </Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}> {createMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {createSuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Transfer the KIP-37 Token</h3>
            <Text>
              Enter the recipient address, token ID, and amount of the KIP-37
              Token to be transferred among the KIP-37 Tokens you have.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <Label>Recipient's Address</Label>
              <CardExample exValue={exAddress} onClickTry={setToAddress} />
              <FormInput
                type="text"
                placeholder="Recipient Address"
                onChange={setToAddress}
                value={toAddress}
              />
            </CardSection>
            <CardSection>
              <Label>Token ID</Label>
              <FormInput
                type="text"
                placeholder="Token ID (e.g., 0)"
                onChange={setTransferId}
                value={transferId}
              />
            </CardSection>
            <CardSection>
              <Label>Token Amount</Label>
              <FormInput
                type="text"
                placeholder="Token Amount (e.g., 2)"
                onChange={setTransferAmount}
                value={transferAmount}
              />
            </CardSection>
            <CardSection>
              <Button disabled={transferButtonDisabled} onClick={transfer}>
                Transfer
              </Button>
            </CardSection>
            {!!transferMsg && (
              <CardSection>
                {transferSuccess ? (
                  <Text>
                    {transferMsg} You can check it below link:
                    <br />
                    <a
                      href={
                        URLMAP.network[network]['finderNFT'] +
                        contractAddress +
                        '?tabId=nftInventory&search=' +
                        toAddress
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      KIP-37 Token Inventory
                    </a>
                  </Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}> {transferMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {createSuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Mint the KIP-37 Token</h3>
            <Text>
              Enter the recipient's address who will receive the newly minted
              KIP-37 token and the number of tokens.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <Label>Recipient's Address</Label>
              <CardExample
                exValue={exAddress}
                onClickTry={setRecipientAddress}
              />
              <FormInput
                type="text"
                placeholder="Recipient Address"
                onChange={setRecipientAddress}
                value={recipientAddress}
              />
            </CardSection>
            <CardSection>
              <Label>Token Amount</Label>
              <FormInput
                type="text"
                placeholder="Token Amount (e.g., 3)"
                onChange={setTokenAmount}
                value={tokenAmount}
              />
            </CardSection>
            <CardSection>
              <Button disabled={mintButtonDisabled} onClick={mint}>
                Mint
              </Button>
            </CardSection>
            {!!mintMsg && (
              <CardSection>
                {mintSuccess ? (
                  <Text>
                    {mintMsg} You can check it below link:
                    <br />
                    <a
                      href={
                        URLMAP.network[network]['finderNFT'] +
                        contractAddress +
                        '?tabId=nftInventory&search=' +
                        recipientAddress
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      KIP-37 Token Inventory
                    </a>
                  </Text>
                ) : (
                  <Text style={{ color: '#c221a9' }}> {mintMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
    </Column>
  )
}

export default KIP37Deploy
