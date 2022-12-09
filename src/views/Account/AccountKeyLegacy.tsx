import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, { TransactionReceipt } from 'caver-js'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'

import { COLOR, URLMAP } from 'consts'

import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  View,
  Label,
  FormInput,
  CodeBlock,
  Row,
  LinkA,
  ResultForm,
  CardSection,
  PrivateKeyWarning,
} from 'components'
import { ResultFormType } from 'types'
import useAccounts from 'hooks/account/useAccounts'
import { generateSingleKey } from 'logics/caverFuncntions'

const AccountKeyLegacyOnchain = (): ReactElement => {
  const navigate = useNavigate()
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  const [privateKey, setPrivateKey] = useState('')
  const [result, setResult] = useState<ResultFormType<TransactionReceipt>>()

  const { keyring, keyringErrMsg } = useMemo(() => {
    if (privateKey) {
      try {
        return {
          keyring: caver.wallet.keyring.createFromPrivateKey(privateKey),
        }
      } catch (error) {
        return {
          keyringErrMsg: _.toString(error),
        }
      }
    }
    return {}
  }, [privateKey])

  const { accountInfo, refetchAccountInfo } = useAccounts({
    caver,
    keyring,
  })

  useEffect(() => {
    setResult(undefined)
  }, [privateKey])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Basic Account (AccountKeyLegacy)</h3>
          <Text>
            {
              'You can create a new account with AccountKeyLegacy. The account has an address derived from the corresponding key pair.\n'
            }
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeylegacy">
              [Docs : AccountKeyLegacy]
            </LinkA>
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <CardSection>
            <Label>Private Key</Label>
            <View style={{ paddingBottom: 10 }}>
              <FormInput
                value={privateKey}
                onChange={setPrivateKey}
                placeholder="Input private key"
              />
              {keyringErrMsg && (
                <Text style={{ color: COLOR.error }}>{keyringErrMsg}</Text>
              )}
            </View>
            <Button onClick={(): void => setPrivateKey(generateSingleKey())}>
              Generate a private key
            </Button>
            <CodeBlock
              title="caver-js code"
              text={`const privateKey = caver.wallet.keyring.generateSingleKey()`}
            />
          </CardSection>

          {keyring && (
            <CardSection>
              <Label>Keyring from private key</Label>
              <View style={{ paddingBottom: 10 }}>
                <CodeBlock
                  text={JSON.stringify(keyring, null, 2)}
                  toggle={false}
                />
                <CodeBlock
                  title="caver-js code"
                  text={`const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
                />
              </View>

              <LinkA link="https://baobab.wallet.klaytn.foundation/faucet">
                <Row style={{ gap: 4, alignItems: 'center' }}>
                  <Text style={{ color: COLOR.primary }}>
                    1. Get some testnet KLAY
                  </Text>
                  <Button size="sm">Move to get KLAY</Button>
                </Row>
              </LinkA>
              <Row style={{ gap: 4, alignItems: 'center' }}>
                <Text>Address : </Text>
                <View style={{ flex: 1 }}>
                  <CodeBlock text={keyring.address} toggle={false} />
                </View>
              </Row>
              <Row style={{ gap: 4, alignItems: 'center' }}>
                <Text style={{ color: COLOR.primary }}>
                  2. After getting testnet KLAY, you can retrieve your account
                  info from Baobab network.
                </Text>
                <Button size="sm" onClick={refetchAccountInfo}>
                  Refetch account info
                </Button>
              </Row>
            </CardSection>
          )}
          {accountInfo && (
            <CardSection>
              <Label>Account info of on-chain</Label>
              <View style={{ paddingBottom: 10 }}>
                <CodeBlock
                  text={JSON.stringify(accountInfo, null, 2)}
                  toggle={false}
                />
                <CodeBlock
                  title="caver-js code"
                  text={`const accountKey = await caver.rpc.klay.getAccountKey(keyring.address)
const hexBalance = await caver.rpc.klay.getBalance(keyring.address)
return {
  address: keyring.address,
  accountKey,
  klay_balance: caver.utils.fromPeb(hexBalance, 'KLAY'),
}`}
                />
              </View>

              <Text>Advanced account</Text>
              <Button
                onClick={(): void => {
                  navigate({
                    pathname: '/account/accountKeyPublic',
                    search: `?pkey=${privateKey}`,
                  })
                }}
              >
                AccountKeyPublic
              </Button>
            </CardSection>
          )}
          <ResultForm title={'Receipt of transaction'} result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default AccountKeyLegacyOnchain
