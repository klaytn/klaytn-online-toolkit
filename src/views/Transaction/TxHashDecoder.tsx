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
  Column,
  Text,
  FormTextarea,
  FormSelect,
  ResultForm,
  CardSection,
  CodeBlock,
  CardExample,
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

  const decodeTxHash = async () => {
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
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">TxHash Decoder</h3>
          <Text>
            On this page, you can query a transaction by transaction hash from
            the Klaytn network to get a caver transaction instance.
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
            />
          </CardSection>
          <CardSection>
            <Label>Transaction Hash</Label>
            <CardExample exValue={exValue} onClickTry={setTxHash} />
            <FormTextarea
              style={{ height: 100 }}
              value={txHash}
              onChange={setTxHash}
            />
          </CardSection>
          <CardSection>
            <Button onClick={decodeTxHash}>Decode</Button>
            <CodeBlock
              title="caver-js code"
              text={`const decoded = caver.transaction.getTransactionByHash(txHash)
const rawTransaction = decoded.getRawTransaction()`}
            />
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
    </Column>
  )
}

export default TxHashDecoder
