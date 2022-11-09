import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Keystore } from 'caver-js'
import _ from 'lodash'

import { URLMAP, UTIL } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Column,
  Text,
  LinkA,
  FormInput,
  FormSelect,
  CardSection,
} from 'components'
import FormFile from 'components/FormFile'

type NetworkType = 'mainnet' | 'testnet'

const KIP7Deploy = (): ReactElement => {
  const [network, setNetwork] = useState<NetworkType>('mainnet')
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

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  useEffect(() => {
    setTimeout(() => {
      setSenderDecryptMsg('')
    }, 5000)
  }, [senderDecryptMsg])

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

        setSenderDecryptMsg('Decryption succeeds!')
        setSenderAddress(keyring.address)
      } else {
        throw Error('Keystore file is not uploaded!')
      }
    } catch (err) {
      setSenderDecryptMsg(_.toString(err))
      setSenderAddress('')
    }
  }

  const deploy = async () => {
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
      }, 5000)
    }
  }

  return (
    <Column>
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
        </CardHeader>
        <CardBody>
          <h3 className="title"> Upload Deployer Keystore File</h3>
          <Text>
            Upload keystore file. This account must have enough KLAY to deploy a
            token contract.
          </Text>
          <CardSection>
            <Label> Network </Label>
            <FormSelect
              defaultValue={network}
              itemList={[
                { value: 'mainnet', label: 'Mainnet' },
                { value: 'testnet', label: 'Testnet' },
              ]}
              onChange={setNetwork}
            />
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
            <Button onClick={decryptSenderKeystore}>Decrypt</Button>
          </CardSection>
          {!!senderDecryptMsg && (
            <CardSection>
              <Text style={{ color: '#c221a9' }}>{senderDecryptMsg}</Text>
            </CardSection>
          )}
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
              type="number"
              placeholder="Decimal (e.g., 18)"
              onChange={setDecimal}
              value={decimal}
            />
          </CardSection>
          <CardSection>
            <Label>Initial Supply</Label>
            <FormInput
              type="number"
              placeholder="Initial Supply (e.g., 1e18)"
              onChange={setInitialSupply}
              value={initialSupply}
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
                  {deployMsg} Deployed token information can be found below
                  link:
                  <br />
                  <LinkA
                    link={
                      URLMAP.network[network]['finderToken'] + contractAddress
                    }
                  >
                    {contractAddress}
                  </LinkA>
                </Text>
              ) : (
                <Text style={{ color: '#c221a9' }}>{deployMsg}</Text>
              )}
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default KIP7Deploy
