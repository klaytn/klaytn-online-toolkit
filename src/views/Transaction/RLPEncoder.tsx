import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { CreateTransactionObject } from 'caver-js'
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
  FormTextarea,
  ResultForm,
  CardSection,
  CodeBlock,
  CardExample,
  View,
} from 'components'
import { ResultFormType } from 'types'

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

const EX_VALUE: Record<TxType, CreateTransactionObject> = {
  legacyTransaction: {
    to: '0x9957dfd92e4b70f91131c573293343bc5f21f215',
    value: Caver.utils.convertToPeb('3', 'KLAY').toString(),
    gas: 25000,
  },
  valueTransfer: {
    from: '0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6',
    to: '0x9957dfd92e4b70f91131c573293343bc5f21f215',
    value: Caver.utils.convertToPeb('4', 'KLAY').toString(),
    gas: 25000,
  },
  valueTransferMemo: {
    from: '0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6',
    to: '0x9957dfd92e4b70f91131c573293343bc5f21f215',
    value: Caver.utils.convertToPeb('5', 'KLAY').toString(),
    gas: '25000',
    input: '0x68656c6c6f',
  },
  accountUpdate: {
    from: '0xeeec7a5d061e90f62153a728d07f8d39139a83b2',
    gas: '25000',
  },
  smartContractDeploy: {
    from: '0x8b56758b52cc56a7a0ab4c9d7698c73737edccba',
    input:
      '0xb6b55f25000000000000000000000000000000000000000000000025424176fc73dd7156',
    gas: '139944',
  },
  smartContractExecution: {
    from: '0xbb42218d2b2e6f0ea253c3b3917ed377c5aa86be',
    to: '0x2bc652f0a7cedcaa334afe73520eeeaea6017739',
    input:
      '0xa9059cbb0000000000000000000000000e9648a7d5fa246a04b342c74a4e5e75b45feb7e0000000000000000000000000000000000000000000000000000000000000005',
    gas: '59138',
  },
  cancel: {
    from: '0x7d0104ac150f749d36bb34999bcade9f2c0bd2e6',
    nonce: '12',
    gas: '25000',
  },
  chainDataAnchoring: {
    from: '0xb5d6e83dc403a2074ce54b621519e5e7376770ff',
    gas: '100000',
    input:
      '0xf8b480b8b1f8afa06c3cab56d8b7b7c94e7d3f311f2900ef93e0aede964a1db5939e61d4a707fe39a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470a0f045bd6e3e47113e707a49effc1b9c7035534ce8662dfda3a0b651fa64b13575a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470a0c6dec550c15f517d4a57503aeb9222b7d20a582b9f5d631b9e5e6fe13711ef8b83743088820258820145',
  },
  ethereumAccessList: {
    to: '0x9957dfd92e4b70f91131c573293343bc5f21f215',
    value: Caver.utils.convertToPeb('6', 'KLAY').toString(),
    gas: '40000',
    accessList: [
      {
        address: '0x5430192ae264b3feff967fc08982b9c6f5694023',
        storageKeys: [
          '0x0000000000000000000000000000000000000000000000000000000000000003',
          '0x0000000000000000000000000000000000000000000000000000000000000007',
        ],
      },
    ],
  },
  ethereumDynamicFee: {
    to: '0x9957dfd92e4b70f91131c573293343bc5f21f215',
    value: Caver.utils.convertToPeb('7', 'KLAY').toString(),
    gas: '50000',
  },
}

const RLPEncoder = (): ReactElement => {
  const [txType, setTxType] = useState<TxType>('legacyTransaction')
  const [inputTx, setInputTx] = useState('')
  const [result, setResult] = useState<ResultFormType>()

  const caver = useMemo(() => new Caver(URLMAP.network['mainnet']['rpc']), [])

  const exValue = useMemo(
    () => JSON.stringify(EX_VALUE[txType], null, 4),
    [txType]
  )

  const encodeTx = async (): Promise<void> => {
    setResult(undefined)
    try {
      const txObject = JSON.parse(inputTx) as CreateTransactionObject

      if (txType === 'accountUpdate') {
        const from = txObject.from || ''
        const accountKey = await caver.rpc.klay.getAccountKey(from)
        const rlpEncodedAccountKey = await caver.rpc.klay.encodeAccountKey(
          accountKey
        )
        const account = caver.account.createFromRLPEncoding(
          from,
          rlpEncodedAccountKey
        )
        txObject.account = account
      }

      const transaction = caver.transaction[txType].create(txObject)
      await transaction.fillTransaction()
      const res = transaction.getRLPEncoding()
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
  }, [inputTx])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">RLP Encoder</h3>
          <Text>
            Will encode the transaction instance and return RLP-encoded
            transaction string for each transaction type.
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <Label>Transaction Type</Label>
            <FormSelect
              defaultValue={txType}
              itemList={_.map(TX_TYPE, (val, key) => ({
                label: _.capitalize(key.replace(/([A-Z])/g, ' $1').trim()),
                value: key as TxType,
              }))}
              onChange={setTxType}
              containerStyle={{ width: 200 }}
            />
          </CardSection>
          <CardSection>
            <Label>{TX_TYPE[txType]}</Label>
            <CardExample exValue={exValue} onClickTry={setInputTx} />
            <View style={{ rowGap: 10 }}>
              <FormTextarea
                style={{ height: 200 }}
                value={inputTx}
                onChange={setInputTx}
              />
              <Button onClick={encodeTx}>Encode</Button>
              <CodeBlock
                title="caver-js code"
                text={`import { CreateTransactionObject } from 'caver-js'
txObject: CreateTransactionObject
txType: "legacyTransaction" | "valueTransfer" | "valueTransferMemo" ...

const transaction = caver.transaction[txType].create(txObject)
await transaction.fillTransaction()
const encoded = transaction.getRLPEncoding()`}
              />
            </View>
          </CardSection>
          <ResultForm result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default RLPEncoder
