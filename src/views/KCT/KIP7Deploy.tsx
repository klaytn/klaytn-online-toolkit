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
  LinkA,
  FormInput,
  CardSection,
  PrivateKeyWarning,
  CodeBlock,
  View,
} from 'components'
import FormFile from 'components/FormFile'

const caver = new Caver(URLMAP.network['testnet']['rpc'])

const KIP7Deploy = (): ReactElement => {
  const [senderAddress, setSenderAddress] = useState('')
  const [senderKeystoreJSON, setSenderKeystoreJSON] = useState<Keystore>()
  const [senderKeystorePassword, setSenderKeystorePassword] = useState('')
  const [senderDecryptMsg, setSenderDecryptMsg] = useState('')
  const [deployMsg, setDeployMsg] = useState('')
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [deployButtonDisabled, setDeployButtonDisabled] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [decimal, setDecimal] = useState('')
  const [initialSupply, setInitialSupply] = useState('')
  const [contractAddress, setContractAddress] = useState('')

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

        setSenderDecryptMsg('Decryption succeeds!')
        setSenderAddress(keyring.address)
      } else {
        throw Error('Keystore file is not uploaded!')
      }
    } catch (err) {
      setSenderDecryptMsg(_.toString(err))
      setSenderAddress('')

      setTimeout(() => {
        setSenderDecryptMsg('')
      }, exposureTime)
    }
  }

  const deploy = async (): Promise<void> => {
    try {
      if (senderAddress === '') {
        throw Error('Sender Keystore is not uploaded!')
      }

      setDeployButtonDisabled(true)
      const kip7 = await caver.kct.kip7.deploy(
        {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: Number(decimal),
          initialSupply: initialSupply,
        },
        { from: senderAddress }
      )

      setDeploySuccess(true)
      setDeployMsg(`Token is successfully deployed!`)
      setDeployButtonDisabled(false)
      setContractAddress(kip7.options.address)
    } catch (err) {
      setDeploySuccess(false)
      setDeployMsg(_.toString(err))
      setDeployButtonDisabled(false)
      setContractAddress('')

      setTimeout(() => {
        setDeployMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Deploy KIP-7 Token</h3>
          <Text>
            You can deploy a KIP-7 token contract to the Klaytn blockchain.{' '}
            <LinkA link="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip7#caver-klay-kip7-deploy">
              caver.kct.kip7.deploy
            </LinkA>{' '}
            function is used to deploy a KIP-7 token contract. After successful
            deployment, you can find contract account in explorer.
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <h3 className="title"> Upload Deployer Keystore File</h3>
          <View style={{ marginBottom: 10 }}>
            <Text>
              Upload keystore file. This account must have enough KLAY to deploy
              a token contract.
            </Text>
          </View>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <CardSection>
            <Label>Kesytore</Label>
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
          {!!senderDecryptMsg &&
            (!!senderAddress ? (
              <CardSection>
                <Text>{senderDecryptMsg}</Text>
              </CardSection>
            ) : (
              <CardSection>
                <Text style={{ color: COLOR.error }}>{senderDecryptMsg}</Text>
              </CardSection>
            ))}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="title">Token Information</h3>
          <Text>
            Enter the token information: the name of token, the symbol of the
            token, the number of decimal places the token uses, and the total
            amount of token to be supplied initially.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Token Name</Label>
            <FormInput
              type="text"
              placeholder="Token Name (e.g., MyToken)"
              onChange={setTokenName}
              value={tokenName}
            />
          </CardSection>
          <CardSection>
            <Label>Token Symbol</Label>
            <FormInput
              type="text"
              placeholder="Token Symbol (e.g., MTK)"
              onChange={setTokenSymbol}
              value={tokenSymbol}
            />
          </CardSection>
          <CardSection>
            <Label>Decimal</Label>
            <FormInput
              type="text"
              placeholder="Decimal (e.g., 18)"
              onChange={setDecimal}
              value={decimal}
            />
          </CardSection>
          <CardSection>
            <Label>Initial Supply</Label>
            <FormInput
              type="text"
              placeholder="Initial Supply (e.g., 1e18)"
              onChange={setInitialSupply}
              value={initialSupply}
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
              text={`const kip7 = await caver.kct.kip7.deploy(
  {
    name: tokenName,
    symbol: tokenSymbol,
    decimals: Number(decimal),
    initialSupply: initialSupply,
  },
  { from: senderAddress }
)`}
            />
          </CardSection>
          {!!deployMsg && (
            <CardSection>
              {deploySuccess ? (
                <Text>
                  {deployMsg} Deployed token information can be found below
                  link:
                  <br />
                  <LinkA
                    link={`${URLMAP.network['testnet']['finderToken']}${contractAddress}`}
                  >
                    {contractAddress}
                  </LinkA>
                </Text>
              ) : (
                <Text style={{ color: COLOR.error }}>{deployMsg}</Text>
              )}
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default KIP7Deploy
