import { ReactElement, useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Caver from 'caver-js'
import styled from 'styled-components'
import _ from 'lodash'

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
} from 'components'
import { COLOR, URLMAP, UTIL } from 'consts'
import useLayout from 'hooks/useLayout'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

type NetworkType = 'mainnet' | 'testnet'

type ResultType =
  | {
      success: true
      value: string
    }
  | {
      success: false
      message: string
    }

const EX_VALUE = {
  mainnet: '0x608d45ed14572c854036492dc08c131885ba5de294dd57e6c9468e1116f49063',
  testnet: '0xbeb0c8cbe6a7433459bded0e0f5cf7e48dd9039d38f3a618a82dee63cf297e05',
}

const BlockHashDecoder = (): ReactElement => {
  const { isUnderTabletWidth } = useLayout()

  const [network, setNetwork] = useState<NetworkType>('mainnet')

  const [blockHash, setBlockHash] = useState('')
  const [result, setResult] = useState<ResultType>()
  const caver = useMemo(
    () =>
      new Caver(
        new Caver.providers.HttpProvider(URLMAP.network[network]['rpc'])
      ),
    [network]
  )

  const exValue = useMemo(() => EX_VALUE[network], [network])

  const decodeBlockHash = async () => {
    setResult(undefined)
    try {
      const res = await caver.rpc.klay.getBlockByHash(blockHash)
      setResult({
        success: true,
        value: res ? JSON.stringify(res, null, 2) : '',
      })
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
          <h3 className="title">Block Hash Decoder</h3>
          <Text>Here you can get block information by block hash.</Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>Network</Label>
            <FormSelect
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
              <Text>{`Ex : ${
                isUnderTabletWidth ? UTIL.truncate(exValue) : exValue
              }`}</Text>
              <CopyToClipboard text={exValue}>
                <Button size="sm">Copy</Button>
              </CopyToClipboard>
            </Row>
            <FormInput
              value={blockHash}
              onChange={setBlockHash}
              placeholder="Enter the Block Hash."
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={() => decodeBlockHash()}>DECODE</Button>
          </StyledSection>
          {result && (
            <>
              {result.success ? (
                <StyledSection>
                  <Label>Block</Label>
                  <textarea
                    className="form-control"
                    style={{
                      height: '1000px',
                      backgroundColor: '#adb5bd',
                      color: 'black',
                    }}
                    value={result.value}
                    readOnly
                  />
                  <CopyToClipboard text={result.value}>
                    <Button>Copy To Clipboard</Button>
                  </CopyToClipboard>
                </StyledSection>
              ) : (
                <Text style={{ color: COLOR.error }}> {result.message} </Text>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Column>
  )
}

export default BlockHashDecoder
