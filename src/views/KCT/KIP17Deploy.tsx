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

enum FunctionEnum {
  BURN = 'Burn',
  Transfer = 'Transfer',
  PUP = 'Pause/Unpause',
}

const KIP17Deploy = (): ReactElement => {
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
  const [belowPage, setBelowPage] = useState<FunctionEnum>(FunctionEnum.BURN)

  const exTokenURI = 'https://cryptologos.cc/logos/klaytn-klay-logo.svg?v=023'

  const exTokenReceiver = '0x6CEe3d8c038ab74E2854C158d7B1b55544E814C8'

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
      const kip17 = await caver.kct.kip17.deploy(
        {
          name: tokenName,
          symbol: tokenSymbol,
        },
        { from: senderAddress },
        caver.wallet
      )

      setDeployMsg('KIP-17 smart contract is successfully deployed! ')
      setDeployButtonDisabled(false)
      setContractAddress(kip17.options.address)
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

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const currentTokenId = lastTokenId
      const minted = await deployedContract.mintWithTokenURI(
        nftReceiver,
        currentTokenId,
        tokenURI
      )
      const newMintMsg = `NFT(token ID: ${currentTokenId}) is successfully mintend!`

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
      setNftReceiver('')
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

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const burned = await deployedContract.burn(burnTokenId)
      const newBurnMsg = `NFT(token ID: ${burnTokenId}) is successfully burned!`

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

      const deployedContract = new caver.kct.kip17(contractAddress)
      deployedContract.options.from = senderAddress
      const transferred = await deployedContract.safeTransferFrom(
        senderAddress,
        transferReceiver,
        transferTokenId
      )
      const newTransferMsg = `NFT(token ID: ${transferTokenId}) is successfully transferred!`

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

  const pause = async (): Promise<void> => {
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
        }, exposureTime)
      } else {
        throw Error('Pausing is failed')
      }
    } catch (err) {
      setPauseMsg(_.toString(err))
      setPauseButtonDisabled(false)
      setPauseSuccess(false)

      setTimeout(() => {
        setPauseMsg('')
      }, exposureTime)
    }
  }

  const unpause = async (): Promise<void> => {
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
        setPauseSuccess(false)

        setTimeout(() => {
          setUnpauseMsg('')
        }, exposureTime)
      } else {
        throw Error('Unpausing is failed')
      }
    } catch (err) {
      setUnpauseMsg(_.toString(err))
      setUnpauseButtonDisabled(false)

      setTimeout(() => {
        setUnpauseMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Deploy Non-fungible Token (KIP-17)</h3>
          <Text>
            You can deploy non-fungible token (KIP-17) contracts which provide
            basic functionality to transfer NFTs on the Klaytn testnet. KIP-17
            is derived from ERC-721. But, there are some differences between
            KIP-17 and ERC-721; More optional extensions are defined, like
            minting with URI, burning, and pausing extensions. You can find more
            information{' '}
            <LinkA link="https://kips.klaytn.foundation/KIPs/kip-17">
              here
            </LinkA>
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
              deploy a KIP-17 smart contract.
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
          <h3 className="title">Non-fungible Token (NFT) Information</h3>
          <Text>
            Enter the Non-fungible token (NFT) information: the NFT's name and
            symbol.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>NFT Name</Label>
            <FormInput
              type="text"
              placeholder="NFT Name (e.g., KlaytnEverywhere)"
              onChange={setTokenName}
              value={tokenName}
            />
          </CardSection>
          <CardSection>
            <Label>NFT Symbol</Label>
            <FormInput
              type="text"
              placeholder="NFT Symbol (e.g., KEW)"
              onChange={setTokenSymbol}
              value={tokenSymbol}
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
              text={`const kip17 = await caver.kct.kip17.deploy(
  {
    name: tokenName,
    symbol: tokenSymbol,
  },
  { from: senderAddress }
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
                    NFT Address
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
            <h3 className="title">Mint the Non-fungible Token (NFT)</h3>
            <Text>
              Enter the NFT's receiver and token URI for the image file's
              location.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ rowGap: 5 }}>
                <Label>NFT Receiver</Label>
                <CardExample
                  exValue={exTokenReceiver}
                  onClickTry={setNftReceiver}
                />
                <FormInput
                  type="text"
                  placeholder="Receiver's address"
                  onChange={setNftReceiver}
                  value={nftReceiver}
                />
              </View>
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
                <Button disabled={mintButtonDisabled} onClick={mint}>
                  Mint
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const deployedContract = new caver.kct.kip17(contractAddress)
deployedContract.options.from = senderAddress
const minted = await deployedContract.mintWithTokenURI(
  nftReceiver,
  newTokenId,
  tokenURI
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
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${nftReceiver}`}
                    >
                      NFT Inventory
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
            { title: 'Pause/Unpause', value: FunctionEnum.PUP },
          ]}
          selectedValue={belowPage}
          onClick={setBelowPage}
        />
      )}
      {mintSuccess && belowPage === FunctionEnum.BURN && (
        <Card>
          <CardHeader>
            <h3 className="title">Burn the Non-fungible Token (NFT)</h3>
            <Text>Enter the token Id you own and want to burn.</Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <Label>Burn Token Id</Label>
              <FormInput
                type="text"
                placeholder="NFT TokenId you own"
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
                text={`const deployedContract = new caver.kct.kip17(contractAddress)
deployedContract.options.from = senderAddress
const burned = await deployedContract.burn(burnTokenId)`}
              />
            </CardSection>
            {!!burnMsg && (
              <CardSection>
                {burnSuccess ? (
                  <Text>
                    {burnMsg} You can see that the NFT you just removed no
                    longer exists:{' '}
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${senderAddress}`}
                    >
                      NFT Inventory
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
            <h3 className="title">Transfer the Non-fungible Token (NFT)</h3>
            <Text>Enter the token Id you own and want to transfer.</Text>
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
                placeholder="NFT TokenId you own"
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
                text={`const deployedContract = new caver.kct.kip17(contractAddress)
deployedContract.options.from = senderAddress
const transferred = await deployedContract.safeTransferFrom(
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
                    {transferMsg} You can see that the NFT you just sent:{' '}
                    <LinkA
                      link={`${URLMAP.network['testnet']['finderNFT']}${contractAddress}?tabId=nftInventory&search=${transferReceiver}`}
                    >
                      NFT Inventory
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
      {mintSuccess && !pauseSuccess && belowPage === FunctionEnum.PUP && (
        <Card>
          <CardHeader>
            <h3 className="title">Pause the KIP-17 Token Smart Contract</h3>
            <Text>
              You can suspend functions related to sending tokens. If you pause
              a smart contract, you could not send an NFT.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={pauseButtonDisabled} onClick={pause}>
                  Pause
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const deployedContract = new caver.kct.kip17(contractAddress)
deployedContract.options.from = senderAddress
await deployedContract.pause()`}
              />
            </CardSection>
            {!!unpauseMsg && (
              <CardSection>
                {!pauseSuccess ? (
                  <Text>{unpauseMsg}</Text>
                ) : (
                  <Text style={{ color: COLOR.error }}>{unpauseMsg}</Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
      {mintSuccess && pauseSuccess && belowPage === FunctionEnum.PUP && (
        <Card>
          <CardHeader>
            <h3 className="title">Unpause the KIP-17 Token Smart Contract</h3>
            <Text>
              You can resume the paused contract. If you unpause a smart
              contract, you could resend an NFT.
            </Text>
          </CardHeader>
          <CardBody>
            <CardSection>
              <View style={{ marginBottom: 10 }}>
                <Button disabled={unpauseButtonDisabled} onClick={unpause}>
                  Unpause
                </Button>
              </View>
              <CodeBlock
                title="caver-js code"
                text={`const deployedContract = new caver.kct.kip17(contractAddress)
deployedContract.options.from = senderAddress
await deployedContract.unpause()`}
              />
            </CardSection>
            {!!pauseMsg && (
              <CardSection>
                {pauseSuccess ? (
                  <Text>{pauseMsg}</Text>
                ) : (
                  <Text style={{ color: COLOR.error }}>{pauseMsg}</Text>
                )}
              </CardSection>
            )}
          </CardBody>
        </Card>
      )}
    </Container>
  )
}

export default KIP17Deploy
