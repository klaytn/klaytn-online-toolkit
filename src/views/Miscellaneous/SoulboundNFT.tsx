import { ReactElement, useMemo, useState } from 'react'
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
  CardExample,
  LinkA,
  PrivateKeyWarning,
  CodeBlock,
  View,
} from 'components'
import FormFile from 'components/FormFile'

import {
  exposureTime,
  exTokenURI,
  exTokenReceiver,
} from './constants/exSoulboundNFTdata'

import { exSBTAbi } from './constants/exSBTAbi'
import exSBTBytecode from './constants/exSBTBytecode'

enum FunctionEnum {
  BURN = 'Burn',
  Transfer = 'Transfer',
}

const SoulboundNFT = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  const [senderAddress, setSenderAddress] = useState('')
  const [senderKeystoreJSON, setSenderKeystoreJSON] = useState<Keystore>()
  const [senderKeystorePassword, setSenderKeystorePassword] = useState('')
  const [senderDecryptMessage, setSenderDecryptMessage] = useState('')

  const [deployMsg, setDeployMsg] = useState('')
  const [deployButtonDisabled, setDeployButtonDisabled] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)

  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenURI, setTokenURI] = useState('')

  const [contractAddress, setContractAddress] = useState('')
  const [sbtReceiver, setSbtReceiver] = useState('')

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

  const [belowPage, setBelowPage] = useState<FunctionEnum>(FunctionEnum.BURN)

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

      const sbt = caver.contract.create(JSON.parse(JSON.stringify(exSBTAbi)))
      const sbtInstance = await sbt.deploy(
        { from: senderAddress, gas: 6000000 },
        exSBTBytecode,
        tokenName,
        tokenSymbol,
        tokenURI
      )

      setDeployMsg('SBT smart contract is successfully deployed! ')
      setDeployButtonDisabled(false)
      setContractAddress(sbtInstance.options.address)
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

  const mint = async (): Promise<void> => {
    try {
      setMintButtonDisabled(true)

      const sbt = new caver.contract(
        JSON.parse(JSON.stringify(exSBTAbi)),
        contractAddress
      )
      sbt.options.from = senderAddress
      const currentTokenId = lastTokenId
      const minted = await sbt.send(
        { from: senderAddress, gas: 1000000 },
        'safeMint',
        sbtReceiver,
        currentTokenId
      )

      const newMintMsg = `SBT(token ID: ${currentTokenId}) is successfully mintend!`

      if (minted) {
        setMintMsg(newMintMsg)
        setMintButtonDisabled(false)
        setMintSuccess(true)
        setLastTokenId(currentTokenId + 1)
      } else {
        throw Error('Minting is failed')
      }
    } catch (err) {
      setMintMsg(_.toString(err))
      setMintButtonDisabled(false)
      setSbtReceiver('')
      setTokenURI('')
      setMintSuccess(false)

      setTimeout(() => {
        setMintMsg('')
      }, exposureTime)
    }
  }

  const burn = async (): Promise<void> => {
    try {
      setBurnButtonDisabled(true)

      const sbt = new caver.contract(
        JSON.parse(JSON.stringify(exSBTAbi)),
        contractAddress
      )
      sbt.options.from = senderAddress
      let burned = await sbt.send(
        { from: senderAddress, gas: 1000000 },
        'burn',
        burnTokenId
      )
      const newBurnMsg = `SBT(token ID: ${burnTokenId}) is successfully burned!`

      if (burned) {
        setBurnMsg(newBurnMsg)
        setBurnButtonDisabled(false)
        setBurnSuccess(true)
      } else {
        throw Error('Burning is failed')
      }
    } catch (err) {
      setBurnMsg(_.toString(err))
      setBurnButtonDisabled(false)
      setBurnTokenId('')
      setBurnSuccess(false)

      setTimeout(() => {
        setBurnMsg('')
      }, exposureTime)
    }
  }

  const transfer = async (): Promise<void> => {
    try {
      setTransferButtonDisabled(true)

      const sbt = new caver.contract(
        JSON.parse(JSON.stringify(exSBTAbi)),
        contractAddress
      )
      sbt.options.from = senderAddress
      let transferred = await sbt.send(
        { from: senderAddress, gas: 1000000 },
        'safeTransferFrom',
        senderAddress,
        transferReceiver,
        transferTokenId
      )

      const newTransferMsg = `SBT(token ID: ${transferTokenId}) is successfully transferred!`

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
      setTransferTokenId('')
      setTransferReceiver('')
      setTransferSuccess(false)

      setTimeout(() => {
        setTransferMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Deploy Soulbound NFT (SBT)</h3>
          <Text>
            A soulbound token (SBT) is a non-fungible token bound to a single
            account. You can easily deploy SBT contracts here. Through the
            process below, you will check the difference between general NFTs
            and SBTs. You are able to find more information about
            soulboundToken:{' '}
            <LinkA link="https://github.com/Bisonai/sbt-contracts">
              SBT Smart Contracts Github
            </LinkA>{' '}
            and{' '}
            <LinkA link="https://vitalik.ca/general/2022/01/26/soulbound.html">
              Vitalik's blog: Soulbound
            </LinkA>
            . After successful deployment, you can verify a contract account
            status in the block explorer.
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <h3 className="title"> Upload Deployer Keystore File</h3>
          <View style={{ marginBottom: 10 }}>
            <Text>
              Upload the Keystore file. This account must have enough KLAY to
              deploy a smart contract.
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
          <h3 className="title">Soulbound NFT (SBT) Information</h3>
          <Text>
            Enter the Soulbound NFT (SBT) information: the SBT's name, symbol,
            and URI.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>SBT Name</Label>
            <FormInput
              type="text"
              placeholder="SBT Name (e.g., KlaySoul)"
              onChange={setTokenName}
              value={tokenName}
            />
          </CardSection>
          <CardSection>
            <Label>SBT Symbol</Label>
            <FormInput
              type="text"
              placeholder="SBT Symbol (e.g., KSOUL)"
              onChange={setTokenSymbol}
              value={tokenSymbol}
            />
          </CardSection>
          <CardSection>
            <CardExample exValue={exTokenURI} onClickTry={setTokenURI} />
            <Label>SBT URI</Label>
            <FormInput
              type="text"
              placeholder="SBT URI"
              onChange={setTokenURI}
              value={tokenURI}
            />
          </CardSection>
          <CardSection>
            <View style={{ marginBottom: 10 }}>
              <Button disabled={deployButtonDisabled} onClick={deploy}>
                Deploy
              </Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`const sbt = caver.contract.create(JSON.parse(JSON.stringify(exSBTAbi)))
      
const sbtInstance = await sbt.deploy(
  { from: senderAddress, gas: 6000000 },
  exSBTBytecode,
  tokenName,
  tokenSymbol,
  tokenURI
)`}
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
                    SBT Address
                  </LinkA>
                </Text>
              ) : (
                <Text style={{ color: COLOR.error }}>{deployMsg}</Text>
              )}
            </CardSection>
          )}
        </CardBody>
      </Card>
      {deploySuccess && (
        <Card>
          <CardHeader>
            <h3 className="title">Mint the Soulbound NFT (SBT)</h3>
            <Text>
              Enter the SBT's receiver. Token CANNOT be re-issued to users who
              already own it.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ rowGap: 5 }}>
                <Label>SBT Receiver</Label>
                <CardExample
                  exValue={exTokenReceiver}
                  onClickTry={setSbtReceiver}
                />
                <FormInput
                  type="text"
                  placeholder="Receiver's address"
                  onChange={setSbtReceiver}
                  value={sbtReceiver}
                />
              </View>
            </CardSection>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={mintButtonDisabled} onClick={mint}>
                  Mint
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const sbt = new caver.contract(
  JSON.parse(JSON.stringify(exSBTAbi)),
  contractAddress
)
sbt.options.from = senderAddress
const currentTokenId = lastTokenId
const minted = await sbt.send(
  { from: senderAddress, gas: 1000000 },
  'safeMint',
  sbtReceiver,
  currentTokenId
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
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${sbtReceiver}`}
                    >
                      SBT Inventory
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}>{mintMsg}</Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && (
        <FormRadio
          itemList={[
            { title: 'Burn', value: FunctionEnum.BURN },
            { title: 'Transfer', value: FunctionEnum.Transfer },
          ]}
          selectedValue={belowPage}
          onClick={setBelowPage}
        />
      )}
      {mintSuccess && belowPage === FunctionEnum.BURN && (
        <Card>
          <CardHeader>
            <h3 className="title">Burn the Soulbound Token (SBT)</h3>
            <Text>
              Enter the token Id you own and want to burn. You CANNOT burn
              tokens that you do not own.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <Label>Burn Token Id</Label>
              <FormInput
                type="text"
                placeholder="SBT TokenId you own"
                onChange={setBurnTokenId}
                value={burnTokenId}
              />
            </CardSection>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={burnButtonDisabled} onClick={burn}>
                  Burn
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const sbt = new caver.contract(
  JSON.parse(JSON.stringify(exSBTAbi)),
  contractAddress
)
sbt.options.from = senderAddress
let burned = await sbt.send(
  { from: senderAddress, gas: 1000000 },
  'burn',
  burnTokenId
)`}
              />
            </CardSection>
            {!!burnMsg && (
              <CardSection>
                {burnSuccess ? (
                  <Text>
                    {burnMsg} You can see that the SBT you just removed no
                    longer exists:{' '}
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${senderAddress}`}
                    >
                      SBT Inventory
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}> {burnMsg} </Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && belowPage === FunctionEnum.Transfer && (
        <Card>
          <CardHeader>
            <h3 className="title">Transfer the Soulbound NFT (SBT)</h3>
            <Text>
              Enter the token Id you own and want to transfer. The most
              significant feature of SBT is that it CANNOT be transferred to
              others.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ rowGap: 5 }}>
                <Label>Transfer Receiver</Label>
                <CardExample
                  exValue={exTokenReceiver}
                  onClickTry={setTransferReceiver}
                />
                <FormInput
                  type="text"
                  placeholder="The address of the receiver"
                  onChange={setTransferReceiver}
                  value={transferReceiver}
                />
              </View>
            </CardSection>
            <CardSection>
              <Label>Transfer Token Id</Label>
              <FormInput
                type="text"
                placeholder="SBT TokenId you own"
                onChange={setTransferTokenId}
                value={transferTokenId}
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
                text={`const sbt = new caver.contract(
  JSON.parse(JSON.stringify(exSBTAbi)),
  contractAddress
)
sbt.options.from = senderAddress
let transferred = await sbt.send(
  { from: senderAddress, gas: 1000000 },
  'safeTransferFrom',
  senderAddress,
  transferReceiver,
  transferTokenId
)`}
              />
            </CardSection>
            {!!transferMsg && (
              <CardSection>
                {transferSuccess ? (
                  <Text>
                    {transferMsg} You can see that the SBT you just sent:{' '}
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${transferReceiver}`}
                    >
                      SBT Inventory
                    </LinkA>
                  </Text>
                ) : (
                  <Text style={{ color: COLOR.error }}>{transferMsg}</Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
    </Container>
  )
}

export default SoulboundNFT
