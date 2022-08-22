import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { AccountKeyForRPC } from 'caver-js'
import _ from 'lodash'

import { URLMAP } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  Container,
  Text,
  FormSelect,
  ResultForm,
  FormInput,
  CardSection,
  CodeBlock,
} from 'components'
import { ResultFormType } from 'types'

const idToType: Record<number, string> = {
  1: 'AccountKeyLegacy',
  2: 'AccountKeyPublic',
  3: 'AccountKeyFail (used for Smart Contract Accounts)',
  4: 'AccountKeyWeightedMultiSig',
  5: 'AccountKeyRoleBased',
}

type NetworkType = 'mainnet' | 'testnet'

const CheckAccountKey = (): ReactElement => {
  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [inputAddress, setInputAddress] = useState('')
  const [result, setResult] = useState<ResultFormType<AccountKeyForRPC>>()

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const title = useMemo(() => {
    if (result?.success && result.value?.keyType) {
      const keyType = idToType[result.value.keyType]
      if (keyType) {
        return `The account key type of given address is ${keyType}.`
      }
    }
  }, [result])

  const checkAddress = async (): Promise<void> => {
    setResult(undefined)
    try {
      const res = await caver.rpc.klay.getAccountKey(inputAddress)
      if (!res) {
        throw Error(
          'The address does not exist on the actual blockchain network.'
        )
      }

      setResult({
        success: true,
        value: res,
      })
    } catch (err) {
      setResult({
        success: false,
        message: _.toString(err),
      })
    }
  }

  useEffect(() => {
    setResult(undefined)
  }, [inputAddress])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Check Account Key Type</h3>
          <Text>
            You can check the account key of the Externally Owned Account (EOA)
            of the given address. The account key consist of public key(s) and a
            key type. If the account has AccountKeyLegacy or the account of the
            given address is a Smart Contract Account, it will return an empty
            key value.
          </Text>
        </CardHeader>
        <CardBody>
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
            <Label>Address</Label>
            <FormInput value={inputAddress} onChange={setInputAddress} />
          </CardSection>
          <CardSection>
            <Button onClick={checkAddress}>Check</Button>
            <CodeBlock
              title="caver-js code"
              text={`const accountKeyForRPC = await caver.rpc.klay.getAccountKey(inputAddress)`}
            />
          </CardSection>
          <ResultForm title={title} result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default CheckAccountKey
