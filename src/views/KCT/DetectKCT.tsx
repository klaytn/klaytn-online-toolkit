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
  Container,
  Text,
  FormSelect,
  FormInput,
  Button,
  CardSection,
  ResultForm,
  LinkA,
  CodeBlock,
  View,
} from 'components'

type NetworkType = 'mainnet' | 'testnet'

const DetectKCT = (): ReactElement => {
  const [contractAddress, setContractAddress] = useState('')
  const [result, setResult] = useState<ResultFormType>()
  const [network, setNetwork] = useState<NetworkType>('mainnet')
  const [description, setDescription] = useState<KCTEnum>()

  const caver = useMemo(
    () => new Caver(URLMAP.network[network]['rpc']),
    [network]
  )

  enum KCTEnum {
    KIP7 = 'KIP7',
    KIP17 = 'KIP17',
    KIP37 = 'KIP37',
  }

  const detectKCT = async (): Promise<void> => {
    try {
      const kip7 = await caver.kct.kip7.detectInterface(contractAddress)
      if (kip7.IKIP7) {
        setDescription(KCTEnum.KIP7)
        setResult({
          success: true,
          value: 'KIP-7',
        })
        return
      }

      const kip17 = await caver.kct.kip17.detectInterface(contractAddress)
      if (kip17.IKIP17) {
        setDescription(KCTEnum.KIP17)
        setResult({
          success: true,
          value: 'KIP-17',
        })
        return
      }

      const kip37 = await caver.kct.kip37.detectInterface(contractAddress)
      if (kip37.IKIP37) {
        setDescription(KCTEnum.KIP37)
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
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Klaytn Compatible Token(KCT) Detection</h3>
          <Text>
            <LinkA link="https://kips.klaytn.foundation/token">
              Klaytn Compatible Token
            </LinkA>{' '}
            is a special type of a smart contract that implements certain
            technical specifications. You can check which KCT the smart contract
            implements using its address.
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
            <View style={{ rowGap: 10 }}>
              <View>
                <Label>Contract Address</Label>
                <FormInput
                  type="text"
                  placeholder="Address"
                  onChange={setContractAddress}
                  value={contractAddress}
                />
              </View>
              <Button onClick={detectKCT}>Check</Button>
              <CodeBlock
                title="caver-js code"
                text={`//1) KIP7
const kip7 = await caver.kct.kip7.detectInterface(contractAddress)

//2) KIP17
const kip17 = await caver.kct.kip17.detectInterface(contractAddress)

//3) KIP37
const kip37 = await caver.kct.kip37.detectInterface(contractAddress)`}
              />
            </View>
          </CardSection>
          <ResultForm title={'Result'} result={result} />
          {result?.success && description === KCTEnum.KIP7 && (
            <CardSection>
              <Text>
                <LinkA link="https://kips.klaytn.foundation/KIPs/kip-7">
                  KIP 7: Fungible Token Standard
                </LinkA>
              </Text>
            </CardSection>
          )}
          {result?.success && description === KCTEnum.KIP17 && (
            <CardSection>
              <Text>
                <LinkA link="https://kips.klaytn.foundation/KIPs/kip-17">
                  KIP 17: Non-fungible Token Standard
                </LinkA>
              </Text>
            </CardSection>
          )}
          {result?.success && description === KCTEnum.KIP37 && (
            <CardSection>
              <Text>
                <LinkA link="https://kips.klaytn.foundation/KIPs/kip-37">
                  KIP 37: Token Standard
                </LinkA>
              </Text>
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default DetectKCT
