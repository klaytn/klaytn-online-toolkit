import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Block } from 'caver-js'
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
  FormInput,
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
  mainnet: '0x608d45ed14572c854036492dc08c131885ba5de294dd57e6c9468e1116f49063',
  testnet: '0xbeb0c8cbe6a7433459bded0e0f5cf7e48dd9039d38f3a618a82dee63cf297e05',
}

const BlockHashDecoder = (): ReactElement => {
  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [blockHash, setBlockHash] = useState('')
  const [result, setResult] = useState<ResultFormType<Block>>()

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const exValue = useMemo(() => EX_VALUE[network], [network])

  const decodeBlockHash = async (): Promise<void> => {
    setResult(undefined)
    try {
      const res = await caver.rpc.klay.getBlockByHash(blockHash)
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
  }, [blockHash])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Block Hash Decoder</h3>
          <Text>Will return block information by block hash.</Text>
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
            <Label>Block Hash</Label>
            <CardExample exValue={exValue} onClickTry={setBlockHash} />
            <View style={{ rowGap: 10 }}>
              <FormInput
                value={blockHash}
                onChange={setBlockHash}
                placeholder="Enter the Block Hash."
              />
              <Button onClick={decodeBlockHash}>Decode</Button>
              <CodeBlock
                title="caver-js code"
                text={`const block = caver.rpc.klay.getBlockByHash(blockHash)`}
              />
            </View>
          </CardSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default BlockHashDecoder
