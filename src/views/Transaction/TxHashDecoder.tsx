import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { AbstractTransaction } from 'caver-js'
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
  FormTextarea,
  FormSelect,
  ResultForm,
  CardSection,
  CodeBlock,
  CardExample,
  View,
} from 'components'
import { ResultFormType } from 'types'

type NetworkType = 'mainnet' | 'testnet'

const EX_VALUE = {
  mainnet: '0x272272d25387cd8b0d3bf842d0d9fa2dee7c014ae66c3fd7a53865453d9bc7cc',
  testnet: '0xc31e393790e48dfcc8bea115ab45287175665f083313ba1012b6f0aca9e0c78e',
}

const TxHashDecoder = (): ReactElement => {
  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [txHash, setTxHash] = useState('')
  const [result, setResult] = useState<ResultFormType<AbstractTransaction>>()
  const [rawTx, setRawTx] = useState('')
  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const exValue = useMemo(() => EX_VALUE[network], [network])

  const decodeTxHash = async (): Promise<void> => {
    setResult(undefined)
    try {
      const res = await caver.transaction.getTransactionByHash(txHash)
      setRawTx(res.getRawTransaction())
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
  }, [txHash])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">TxHash Decoder</h3>
          <Text>
            Query a transaction by transaction hash from Klaytn to get a
            transaction instance.
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
            <Label>Transaction Hash</Label>
            <CardExample exValue={exValue} onClickTry={setTxHash} />
            <View style={{ rowGap: 10 }}>
              <FormTextarea
                style={{ height: 100 }}
                value={txHash}
                onChange={setTxHash}
              />
              <Button onClick={decodeTxHash}>Decode</Button>
              <CodeBlock
                title="caver-js code"
                text={`const tx = caver.transaction.getTransactionByHash(txHash)
const rawTransaction = tx.getRawTransaction()`}
              />
            </View>
          </CardSection>
          <ResultForm result={result} />
          {result?.success && (
            <CardSection>
              <Label>Raw Transaction(RLP-encoded Transaction)</Label>
              <CodeBlock toggle={false} text={rawTx} />
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default TxHashDecoder
