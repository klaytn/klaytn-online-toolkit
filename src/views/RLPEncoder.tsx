import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver from 'caver-js'
import styled from 'styled-components'
import _ from 'lodash'

import { COLOR, URLMAP } from 'consts'
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
  FormSelect,
  FormTextarea,
  CopyButton,
} from 'components'

const StyledSection = styled(View)`
  padding-bottom: 10px;
`

type ResultType =
  | {
      success: true
      value: string
    }
  | {
      success: false
      message: string
    }

const TX_TYPE = {
  legacyTransaction: 'Legacy Transaction ( REQUIRED : to, gas )',
  valueTransfer: 'Value Transfer ( REQUIRED : from, to, value, gas )',
  valueTransferMemo:
    'Value Transfer Memo ( REQUIRED : from, to, value, gas, input)',
  accountUpdate: 'Account Update ( REQUIRED : from, gas )',
  smartContractDeploy: 'Smart Contract Deploy ( REQUIRED : from, input, gas )',
  smartContractExecution:
    'Smart Contract Execution ( REQUIRED : from, to, input, gas )',
  cancel: 'Cancel ( REQUIRED : from, gas )',
  chainDataAnchoring: 'Chain Data Anchoring ( REQUIRED : from, input, gas)',
  ethereumAccessList: 'Ethereum Access List ( REQUIRED : to, gas )',
  ethereumDynamicFee: 'Ethereum Dynamic Fee ( REQUIRED : to, gas )',
}

type TxType = keyof typeof TX_TYPE

const EX_VALUE: Record<TxType, string> = {
  legacyTransaction: `{
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "3",
        "gas": "25000"
}`,
  valueTransfer: `{
        "from": "0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6",
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "5",
        "gas": "25000"
}`,
  valueTransferMemo: `{
        "from": "0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6",
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "7",
        "gas": "25000",
        "input": "0x68656c6c6f"
}`,
  accountUpdate: `{
        "from": "0xeeec7a5d061e90f62153a728d07f8d39139a83b2",
        "gas": "25000"
}`,
  smartContractDeploy: `{
        "from": "0x8b56758b52cc56a7a0ab4c9d7698c73737edccba",
        "input": "0xb6b55f25000000000000000000000000000000000000000000000025424176fc73dd7156",
        "gas": "139944"
}`,
  smartContractExecution: `{
        "from": "0xbb42218d2b2e6f0ea253c3b3917ed377c5aa86be",
        "to": "0x2bc652f0a7cedcaa334afe73520eeeaea6017739",
        "input": "0xa9059cbb0000000000000000000000000e9648a7d5fa246a04b342c74a4e5e75b45feb7e0000000000000000000000000000000000000000000000000000000000000005",
        "gas": "59138"
}`,
  cancel: `{
        "from": "0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6",
        "nonce": "12",
        "gas": "25000"
}`,
  chainDataAnchoring: `{
        "from": "0xb5d6e83dc403a2074ce54b621519e5e7376770ff",
        "gas": "100000",
        "input": "0xf8b480b8b1f8afa06c3cab56d8b7b7c94e7d3f311f2900ef93e0aede964a1db5939e61d4a707fe39a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470a0f045bd6e3e47113e707a49effc1b9c7035534ce8662dfda3a0b651fa64b13575a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470a0c6dec550c15f517d4a57503aeb9222b7d20a582b9f5d631b9e5e6fe13711ef8b83743088820258820145"
}`,
  ethereumAccessList: `{
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "6",
        "gas": "40000",
        "accessList": [
            {
                "address": "0x5430192ae264b3feff967fc08982b9c6f5694023",
                "storageKeys": [
                    "0x0000000000000000000000000000000000000000000000000000000000000003",
                    "0x0000000000000000000000000000000000000000000000000000000000000007"
                ]
            }
        ]
}`,
  ethereumDynamicFee: `{
        "to": "0x9957dfd92e4b70f91131c573293343bc5f21f215",
        "value": "12",
        "gas": "50000"
}`,
}

const RLPEncoder = (): ReactElement => {
  const [txType, setTxType] = useState<TxType>('legacyTransaction')
  const [inputTx, setInputTx] = useState('')
  const [result, setResult] = useState<ResultType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exValue = useMemo(() => EX_VALUE[txType], [txType])

  const encodeTx = async () => {
    setResult(undefined)
    try {
      const jsonTx = JSON.parse(inputTx)
      if (jsonTx.hasOwnProperty('value')) {
        jsonTx['value'] = caver.utils.convertToPeb(jsonTx['value'], 'KLAY')
      }
      let encodedTx

      if (txType === 'legacyTransaction') {
        encodedTx = caver.transaction.legacyTransaction.create(jsonTx)
      } else if (txType === 'valueTransfer') {
        encodedTx = caver.transaction.valueTransfer.create(jsonTx)
      } else if (txType === 'valueTransferMemo') {
        encodedTx = caver.transaction.valueTransferMemo.create(jsonTx)
      } else if (txType === 'accountUpdate') {
        let account
        try {
          const accountKey = await caver.rpc.klay.getAccountKey(jsonTx['from'])
          const rlpEncodedAccountKey = await caver.rpc.klay.encodeAccountKey(
            accountKey
          )
          account = caver.account.createFromRLPEncoding(
            jsonTx['from'],
            rlpEncodedAccountKey
          )
        } catch (err) {
          setResult({
            success: false,
            message: _.toString(err),
          })
          return
        }
        jsonTx['account'] = account
        encodedTx = caver.transaction.accountUpdate.create(jsonTx)
      } else if (txType === 'smartContractDeploy') {
        encodedTx = caver.transaction.smartContractDeploy.create(jsonTx)
      } else if (txType === 'smartContractExecution') {
        encodedTx = caver.transaction.smartContractExecution.create(jsonTx)
      } else if (txType === 'cancel') {
        encodedTx = caver.transaction.cancel.create(jsonTx)
      } else if (txType === 'chainDataAnchoring') {
        encodedTx = caver.transaction.chainDataAnchoring.create(jsonTx)
      } else if (txType === 'ethereumAccessList') {
        encodedTx = caver.transaction.ethereumAccessList.create(jsonTx)
      } else if (txType === 'ethereumDynamicFee') {
        encodedTx = caver.transaction.ethereumDynamicFee.create(jsonTx)
      }
      await encodedTx?.fillTransaction()
      const res = encodedTx?.getRLPEncoding()
      setResult({
        success: true,
        value: res || '',
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
  }, [inputTx])

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">RLP Encoder</h3>
          <Text>
            On this page, you can get a RLP-encoded transaction string for each
            transaction type.
          </Text>
        </CardHeader>
        <CardBody>
          <StyledSection>
            <Label>Transaction Type</Label>
            <FormSelect
              defaultValue={txType}
              itemList={_.map(TX_TYPE, (val, key) => ({
                label: val,
                value: key as TxType,
              }))}
              onChange={setTxType}
            />
          </StyledSection>
          <StyledSection>
            <Label>Block Hash</Label>
            <Row style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text>{`Ex :\n${exValue}`}</Text>
              <View style={{ gap: 4 }}>
                <Button
                  size="sm"
                  onClick={(): void => {
                    setInputTx(exValue)
                  }}
                >
                  Try
                </Button>
                <CopyButton text={exValue} buttonProps={{ size: 'sm' }}>
                  Copy
                </CopyButton>
              </View>
            </Row>
            <FormTextarea
              style={{
                height: '200px',
              }}
              value={inputTx}
              onChange={setInputTx}
            />
          </StyledSection>
          <StyledSection>
            <Button onClick={encodeTx}>Encode</Button>
          </StyledSection>
          {result && (
            <>
              {result.success ? (
                <StyledSection>
                  <Label>Block</Label>
                  <FormTextarea
                    style={{ height: 100 }}
                    value={result.value}
                    readOnly
                  />
                  <CopyButton text={result.value}>Copy the result</CopyButton>
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

export default RLPEncoder
