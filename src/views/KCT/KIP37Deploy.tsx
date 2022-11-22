import { ReactElement, useState } from 'react'
import Caver, { Keystore } from 'caver-js'
import _ from 'lodash'

import { URLMAP, UTIL, COLOR } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Container,
  Text,
  FormInput,
  FormRadio,
  CardSection,
  FormFile,
  CardExample,
  LinkA,
  PrivateKeyWarning,
  CodeBlock,
  View,
} from 'components'

enum FunctionEnum {
  TRANSFER = 'Transfer',
  MINT = 'Mint',
}

const caver = new Caver(URLMAP.network['testnet']['rpc'])

const KIP37Deploy = (): ReactElement => {
  const [senderAddress, setSenderAddress] = useState('')
  const [senderKeystoreJSON, setSenderKeystoreJSON] = useState<Keystore>()
  const [senderKeystorePassword, setSenderKeystorePassword] = useState('')
  const [senderDecryptMessage, setSenderDecryptMessage] = useState('')
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
  const [belowPage, setBelowPage] = useState<FunctionEnum>(
    FunctionEnum.TRANSFER
  )

  const exURI =
    'https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/3.json'

  const exTokenURI =
    'https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/2.json'

  const exAddress = '0x6CEe3d8c038ab74E2854C158d7B1b55544E814C8'

  const exposureTime = 5000

  const handleSenderKeystoreChange = (files?: FileList): void => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event): void => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setSenderKeystoreJSON(json)
        }
      }
    }
  }

  const decryptSenderKeystore = (): void => {
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
      } else {
        throw Error('Sender Keystore is not uploaded!')
      }
    } catch (err) {
      setSenderDecryptMessage(_.toString(err))
      setSenderAddress('')

      setTimeout(() => {
        setSenderDecryptMessage('')
      }, exposureTime)
    }
  }

  const deploy = async (): Promise<void> => {
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
    } catch (err) {
      setDeployMsg(_.toString(err))
      setDeployButtonDisabled(false)
      setContractAddress('')
      setDeploySuccess(false)

      setTimeout(() => {
        setDeployMsg('')
      }, exposureTime)
    }
  }

  const create = async (): Promise<void> => {
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
    } catch (err) {
      setCreateMsg(_.toString(err))
      setCreateButtonDisabled(false)
      setInitialSupply('')
      setTokenURI('')
      setCreateSuccess(false)

      setTimeout(() => {
        setCreateMsg('')
      }, exposureTime)
    }
  }

  const transfer = async (): Promise<void> => {
    try {
      setTransferButtonDisabled(true)

      const deployedContract = new caver.kct.kip37(contractAddress)
      deployedContract.options.from = senderAddress
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
    } catch (err) {
      setTransferMsg(_.toString(err))
      setTransferButtonDisabled(false)
      setToAddress('')
      setTransferId('')
      setTransferAmount('')
      setTransferSuccess(false)

      setTimeout(() => {
        setTransferMsg('')
      }, exposureTime)
    }
  }

  const mint = async (): Promise<void> => {
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
    } catch (err) {
      setMintMsg(_.toString(err))
      setMintButtonDisabled(false)
      setRecipientAddress('')
      setTokenAmount('')
      setMintSuccess(false)

      setTimeout(() => {
        setMintMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Deploy Multiple Token (KIP-37)</h3>
          <Text>
            You can deploy multiple token (KIP-37) contracts. A single deployed
            contract following the KIP-37 token standard may include any
            combination of fungible tokens, non-fungible tokens, or other
            configurations. KIP-37 is derived from ERC-1155. However, there are
            some differences between KIP-37 and ERC-1155; the totalSupply
            function is added to obtain the number of tokens, and more optional
            extensions are defined, like minting, burning, and pausing
            extensions. You can find more information{' '}
            <LinkA link="http://kips.klaytn.foundation/KIPs/kip-37">here</LinkA>
            . After successful deployment, you can find a contract account in
            the block explorer.
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <h3 className="title"> Upload Deployer Keystore File</h3>
          <View style={{ marginBottom: 10 }}>
            <Text>
              Upload the Keystore file. This account must have enough KLAY to
              deploy a KIP-37 smart contract.
            </Text>
          </View>
          <CardSection>
            <Text>Testnet</Text>
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
            <View style={{ marginBottom: 10 }}>
              <Button onClick={decryptSenderKeystore}>Decrypt</Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`import { Keystore } from 'caver-js'
keystoreJSON: Keystore
password: string

const keyring = caver.wallet.keyring.decrypt(keystoreJSON, password)`}
            />
          </CardSection>
          {senderDecryptMessage &&
            (!!senderAddress ? (
              <CardSection>
                <Text>{senderDecryptMessage}</Text>
              </CardSection>
            ) : (
              <CardSection>
                <Text style={{ color: COLOR.error }}>
                  {senderDecryptMessage}
                </Text>
              </CardSection>
            ))}
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
            <View style={{ rowGap: 5 }}>
              <Label>URI</Label>
              <CardExample exValue={exURI} onClickTry={setUri} />
              <FormInput
                type="text"
                placeholder="URI"
                onChange={setUri}
                value={uri}
              />
            </View>
          </CardSection>
          <CardSection>
            <View style={{ marginBottom: 10 }}>
              <Button disabled={deployButtonDisabled} onClick={deploy}>
                Deploy
              </Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`const kip37 = await caver.kct.kip37.deploy({uri: uri}, { from: senderAddress })`}
            />
          </CardSection>
          {!!deployMsg && (
            <CardSection>
              {deploySuccess ? (
                <Text>
                  {deployMsg}You can check it below link:
                  <br />
                  <LinkA
                    link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}`}
                  >
                    KIP-37 Token Address
                  </LinkA>
                </Text>
              ) : (
                <Text style={{ color: COLOR.error }}> {deployMsg} </Text>
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
              <View style={{ rowGap: 5 }}>
                <Label>Token URI</Label>
                <CardExample exValue={exTokenURI} onClickTry={setTokenURI} />
                <FormInput
                  type="text"
                  placeholder="Token URI"
                  onChange={setTokenURI}
                  value={tokenURI}
                />
              </View>
            </CardSection>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={createButtonDisabled} onClick={create}>
                  Create
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const deployedContract = new caver.kct.kip37(contractAddress)
deployedContract.options.from = senderAddress
const created = await deployedContract.create(
  newTokenId,
  initialSupply,
  tokenURI
)`}
              />
            </CardSection>
            {!!createMsg && (
              <CardSection>
                {createSuccess ? (
                  <Text>
                    {createMsg} You can check it below link:
                    <br />
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${senderAddress}`}
                    >
                      KIP-37 Token Inventory
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {createMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {createSuccess && (
        <FormRadio
          itemList={[
            { title: 'Transfer', value: FunctionEnum.TRANSFER },
            { title: 'Mint', value: FunctionEnum.MINT },
          ]}
          selectedValue={belowPage}
          onClick={setBelowPage}
        />
      )}
      {createSuccess && belowPage === FunctionEnum.TRANSFER && (
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
              <View style={{ rowGap: 5 }}>
                <Label>Recipient's Address</Label>
                <CardExample exValue={exAddress} onClickTry={setToAddress} />
                <FormInput
                  type="text"
                  placeholder="Recipient Address"
                  onChange={setToAddress}
                  value={toAddress}
                />
              </View>
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
              <View style={{ marginBottom: 10 }}>
                <Button disabled={transferButtonDisabled} onClick={transfer}>
                  Transfer
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const deployedContract = new caver.kct.kip37(contractAddress)
deployedContract.options.from = senderAddress
const transferred = await deployedContract.safeTransferFrom(
  senderAddress,
  toAddress,
  transferId,
  transferAmount,
  data
)`}
              />
            </CardSection>
            {!!transferMsg && (
              <CardSection>
                {transferSuccess ? (
                  <Text>
                    {transferMsg} You can check it below link:
                    <br />
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${toAddress}`}
                    >
                      KIP-37 Token Inventory
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {transferMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {createSuccess && belowPage === FunctionEnum.MINT && (
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
              <View style={{ rowGap: 5 }}>
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
              </View>
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
              <View style={{ marginBottom: 10 }}>
                <Button disabled={mintButtonDisabled} onClick={mint}>
                  Mint
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const deployedContract = new caver.kct.kip37(contractAddress)
deployedContract.options.from = senderAddress
const minted = await deployedContract.mint(
  recipientAddress,
  currentTokenId,
  tokenAmount
)`}
              />
            </CardSection>
            {!!mintMsg && (
              <CardSection>
                {mintSuccess ? (
                  <Text>
                    {mintMsg} You can check it below link:
                    <br />
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${recipientAddress}`}
                    >
                      KIP-37 Token Inventory
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {mintMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
    </Container>
  )
}

export default KIP37Deploy
