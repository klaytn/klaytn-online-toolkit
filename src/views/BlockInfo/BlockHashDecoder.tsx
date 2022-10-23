import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { Block } from 'caver-js'
import styled from 'styled-components'
import _ from 'lodash'

import { URLMAP, UTIL } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Row,
  Label,
  Column,
  Text,
  View,
  FormInput,
  FormSelect,
  CopyButton,
  ResultForm,
} from 'components'
import useLayout from 'hooks/useLayout'
import { ResultFormType } from 'types'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

type NetworkType = 'mainnet' | 'testnet'

const EX_VALUE = {
  mainnet: '0x608d45ed14572c854036492dc08c131885ba5de294dd57e6c9468e1116f49063',
  testnet: '0xbeb0c8cbe6a7433459bded0e0f5cf7e48dd9039d38f3a618a82dee63cf297e05',
}

const BlockHashDecoder = (): ReactElement => {
  const { isUnderTabletWidth } = useLayout()

  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [blockHash, setBlockHash] = useState('')
  const [result, setResult] = useState<ResultFormType<Block>>()

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  const exValue = useMemo(() => EX_VALUE[network], [network])

  const decodeBlockHash = async () => {
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
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">Block Hash Decoder</h3>
          <Text>Here you can get block information by block hash.</Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>Network</Label>
            <FormSelect
              defaultValue={network}
              itemList={[
                { value: 'mainnet', label: 'Mainnet' },
                { value: 'testnet', label: 'Testnet' },
              ]}
              onChange={setNetwork}
            />
          </StyledSection>
          <StyledSection>
            <Label>Block Hash</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${
                isUnderTabletWidth ? UTIL.truncate(exValue) : exValue
              }`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setBlockHash(exValue)
                  }}
                >
                  Try
                </Button>
                <CopyButton text={exValue} buttonProps={{ size: 'sm' }}>
                  Copy
                </CopyButton>
              </View>
            </Row>
            <FormInput
              value={blockHash}
              onChange={setBlockHash}
              placeholder="Enter the Block Hash."
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={decodeBlockHash}>Decode</Button>
          </StyledSection>
          <ResultForm result={result} height={1000} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default BlockHashDecoder
