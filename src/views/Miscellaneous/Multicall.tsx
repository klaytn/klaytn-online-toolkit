import { ReactElement, useMemo, useState } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'

import { URLMAP, COLOR } from 'consts'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  Text,
  CardSection,
  CodeBlock,
  View,
  Label,
  FormInput,
  LinkA,
} from 'components'

import { exWKLAYAbi } from './constants/exWKLAYAbi'
import { exMulticallAbi } from './constants/exMulticallAbi'
import {
  exposureTime,
  contractAddress,
  wklayContractAddress,
  exAddress1,
  exAddress2,
  exAddress3,
  exAddress4,
  exAddress5,
} from './constants/exMulticallData'

type Res = {
  success: boolean
  returnData: string
}

const Multicall = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  const [multicallMsg, setMulticallMsg] = useState('')
  const [multicallButtonDisabled, setMulticallButtonDisabled] = useState(false)
  const [multicallSuccess, setMulticallSuccess] = useState(false)

  const [address1, setAddress1] = useState(exAddress1)
  const [address2, setAddress2] = useState(exAddress2)
  const [address3, setAddress3] = useState(exAddress3)
  const [address4, setAddress4] = useState(exAddress4)
  const [address5, setAddress5] = useState(exAddress5)

  const [outputArray, setOuputArray] = useState(Array<string>)

  const multicall = async (): Promise<void> => {
    try {
      setMulticallButtonDisabled(true)

      const wklay = new caver.contract(
        JSON.parse(JSON.stringify(exWKLAYAbi)),
        wklayContractAddress
      )

      const multicall = new caver.contract(
        JSON.parse(JSON.stringify(exMulticallAbi)),
        contractAddress
      )

      const calls = [
        wklay.methods.balanceOf(address1),
        wklay.methods.balanceOf(address2),
        wklay.methods.balanceOf(address3),
        wklay.methods.balanceOf(address4),
        wklay.methods.balanceOf(address5),
      ]

      const callRequests = calls.map((call) => ({
        target: call._parent._address,
        callData: call.encodeABI(),
      }))

      const { returnData } = await multicall.call(
        'tryBlockAndAggregate',
        false,
        callRequests
      )
      let output = returnData.map((data: Res, index: number) => {
        const types = calls[index]._method.outputs
        const { __length__, ...result } = caver.abi.decodeParameters(
          types,
          data.returnData
        )
        return Object.values(result)
      })

      output = output.map((elem: Array<string>) =>
        caver.utils.fromPeb(elem[0], 'KLAY')
      )
      setOuputArray(output)

      if (output.length === 5) {
        setMulticallMsg('Multicall is successfully called.')
        setMulticallButtonDisabled(false)
        setMulticallSuccess(true)
      } else {
        throw Error('Multicall is failed')
      }
    } catch (err) {
      setMulticallMsg(_.toString(err))
      setMulticallButtonDisabled(false)
      setMulticallSuccess(false)

      setTimeout(() => {
        setMulticallMsg('')
      }, exposureTime)
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Multicall - Check the WKLAY Balance at Once</h3>
          <Text>
            Multicall aggregates result from multiple smart contract constant
            function calls in a single call. It reduces several JSON RPC
            requests while guaranteeing that all returned values are from the
            same block, like an atomic read. The following example comes from
            the 'Miscellaneous menu - Canonical WKLAY page'. You can deposit or
            transfer the WKLAY to other addresses on that page. After it, change
            the account addresses as you like and check the results here at
            once. You are able to find more information about Multicall:{' '}
            <LinkA link="https://github.com/inevitable-dao/klaytn-multicall">
              Multicall Github Repository1
            </LinkA>{' '}
            and{' '}
            <LinkA link="https://github.com/makerdao/multicall.js">
              Multicall Github Repository2
            </LinkA>
            .
          </Text>
        </CardHeader>
        <CardBody>
          <CardSection>
            <View style={{ marginBottom: 10 }}>
              <Label>Address1</Label>
              <View style={{ paddingBottom: 10 }}>
                <FormInput
                  type="text"
                  placeholder="Address1"
                  onChange={setAddress1}
                  value={address1}
                />
              </View>
              <Label>Address2</Label>
              <View style={{ paddingBottom: 10 }}>
                <FormInput
                  type="text"
                  placeholder="Address2"
                  onChange={setAddress2}
                  value={address2}
                />
              </View>
              <Label>Address3</Label>
              <View style={{ paddingBottom: 10 }}>
                <FormInput
                  type="text"
                  placeholder="Address3"
                  onChange={setAddress3}
                  value={address3}
                />
              </View>
              <Label>Address4</Label>
              <View style={{ paddingBottom: 10 }}>
                <FormInput
                  type="text"
                  placeholder="Address4"
                  onChange={setAddress4}
                  value={address4}
                />
              </View>
              <Label>Address5</Label>
              <View style={{ paddingBottom: 10 }}>
                <FormInput
                  type="text"
                  placeholder="Address5"
                  onChange={setAddress5}
                  value={address5}
                />
              </View>
              <Button disabled={multicallButtonDisabled} onClick={multicall}>
                Multicall
              </Button>
            </View>
            <CodeBlock
              title="caver-js code"
              text={`const wklay = new caver.contract(
  JSON.parse(JSON.stringify(exWKLAYAbi)),
  wklayContractAddress
)

const multicall = new caver.contract(
  JSON.parse(JSON.stringify(exMulticallAbi)),
  contractAddress
)

const calls = [
  wklay.methods.balanceOf(address1),
  wklay.methods.balanceOf(address2),
  wklay.methods.balanceOf(address3),
  wklay.methods.balanceOf(address4),
  wklay.methods.balanceOf(address5),
]

const callRequests = calls.map((call) => ({
  target: call._parent._address,
  callData: call.encodeABI(),
}))

const { returnData } = await multicall.call(
  'tryBlockAndAggregate',
  false,
  callRequests
)
let output = returnData.map((data: Res, index: number) => {
  const types = calls[index]._method.outputs
  const { __length__, ...result } = caver.abi.decodeParameters(
    types,
    data.returnData
  )
  return Object.values(result)
})

output = output.map((elem: Array<string>) =>
  caver.utils.fromPeb(elem[0], 'KLAY')
)
setOuputArray(output)`}
            />
          </CardSection>
          {!!multicallMsg && (
            <CardSection>
              {multicallSuccess ? (
                <>
                  <Text>{multicallMsg}</Text>
                  <Text>
                    {'\n'}
                    Balance of {address1}
                    {`\n-> `}
                    {outputArray[0]} WKLAY
                  </Text>
                  <Text>
                    {'\n'}
                    Balance of {address2}
                    {`\n-> `}
                    {outputArray[1]} WKLAY
                  </Text>
                  <Text>
                    {'\n'}
                    Balance of {address3}
                    {`\n-> `}
                    {outputArray[2]} WKLAY
                  </Text>
                  <Text>
                    {'\n'}
                    Balance of {address4}
                    {`\n-> `}
                    {outputArray[3]} WKLAY
                  </Text>
                  <Text>
                    {'\n'}
                    Balance of {address5}
                    {`\n-> `}
                    {outputArray[4]} WKLAY
                  </Text>
                </>
              ) : (
                <Text style={{ color: COLOR.error }}> {multicallMsg} </Text>
              )}
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default Multicall
