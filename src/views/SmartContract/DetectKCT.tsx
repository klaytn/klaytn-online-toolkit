import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { AbiItem } from 'caver-js'
import _ from 'lodash'

import { URLMAP } from 'consts'
import {
  Card,
  CardHeader,
  CardBody,
  Label,
  Column,
  Text,
  FormSelect,
  FormInput,
  Button,
  FormTextarea,
  FormRadio,
  ResultForm,
  CardSection,
  CodeBlock,
  CardExample,
} from 'components'

type NetworkType = 'mainnet' | 'testnet'

const DetectKCT = (): ReactElement => {
  const [contractAddress, setContractAddress] = useState('')
  const [result, setResult] = useState('')
  const [success, setSuccess] = useState(false)
  const [network, setNetwork] = useState<NetworkType>('mainnet')

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const detectKCT = async () => {
    try {
      const kip7 = await caver.kct.kip7.detectInterface(contractAddress)
      if (kip7.IKIP7) {
        setSuccess(true)
        setResult('KIP-7')
      }
    } catch (err: any) {
      setSuccess(false)
      setResult(err.toString())
    }

    try {
      const kip17 = await caver.kct.kip17.detectInterface(contractAddress)
      if (kip17.IKIP17) {
        setSuccess(true)
        setResult('KIP-17')
      }
    } catch (err: any) {
      setSuccess(false)
      setResult(err.toString())
    }

    try {
      const kip37 = await caver.kct.kip37.detectInterface(contractAddress)
      if (kip37.IKIP37) {
        setSuccess(true)
        setResult('KIP-37')
      }
    } catch (err: any) {
      setSuccess(false)
      setResult(err.toString())
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Klaytn Compatible Token(KCT) Detection</h3>
          <Text>
            <a href="https://kips.klaytn.foundation/KIPs/kip-7">
              {' '}
              Klaytn Compatible Token
            </a>{' '}
            is a special type of a smart contract that implements certain
            technical specifications. You can check which KCT the smart contract
            implements using its address.
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
            />
          </CardSection>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Contract Address</Label>
            <FormInput
              type="text"
              placeholder="Address"
              onChange={setContractAddress}
              value={contractAddress}
            />
            <br />
            <Button onClick={detectKCT}>Check</Button>
          </CardSection>
          {success ? (
            <Text>
              This smart contract implements{' '}
              <a href={URLMAP.kip[result]}>{result} Token Standard</a>.
            </Text>
          ) : (
            <Text> {result} </Text>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default DetectKCT
