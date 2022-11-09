import { ReactElement, useMemo, useState } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'

import { URLMAP } from 'consts'
import { ResultFormType } from 'types'
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
  CardSection,
  ResultForm,
} from 'components'

type NetworkType = 'mainnet' | 'testnet'

const DetectKCT = (): ReactElement => {
  const [contractAddress, setContractAddress] = useState('')
  const [result, setResult] = useState<ResultFormType>()
  const [network, setNetwork] = useState<NetworkType>('mainnet')

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const detectKCT = async () => {
    try {
      const kip7 = await caver.kct.kip7.detectInterface(contractAddress)
      if (kip7.IKIP7) {
        setResult({
          success: true,
          value: 'KIP-7',
        })
        return
      }
    } catch (err) {
      setResult({
        success: false,
        message: _.toString(err),
      })
    }

    try {
      const kip17 = await caver.kct.kip17.detectInterface(contractAddress)
      if (kip17.IKIP17) {
        setResult({
          success: true,
          value: 'KIP-17',
        })
        return
      }
    } catch (err) {
      setResult({
        success: false,
        message: _.toString(err),
      })
    }

    try {
      const kip37 = await caver.kct.kip37.detectInterface(contractAddress)
      if (kip37.IKIP37) {
        setResult({
          success: true,
          value: 'KIP-37',
        })
        return
      }
    } catch (err) {
      setResult({
        success: false,
        message: _.toString(err),
      })
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Klaytn Compatible Token(KCT) Detection</h3>
          <Text>
            <a href="https://kips.klaytn.foundation/token">
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
              containerStyle={{ width: 200 }}
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
          <ResultForm title={'Result'} result={result} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default DetectKCT
