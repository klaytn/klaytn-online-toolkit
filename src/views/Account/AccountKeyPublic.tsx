import { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Caver, {
  EncryptedKeystoreV3Json,
  EncryptedKeystoreV4Json,
  SingleKeyring,
  TransactionReceipt,
} from 'caver-js'
import _ from 'lodash'

import { COLOR, URLMAP, UTIL } from 'consts'

import {
  Column,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  View,
  Label,
  FormInput,
  CodeBlock,
  FormDownload,
  Row,
  LinkA,
  ResultForm,
  CardSection,
  Loading,
} from 'components'
import { useQuery } from 'react-query'
import { ResultFormType } from 'types'

const AccountKeyPublic = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])

  const [privateKey, setPrivateKey] = useState('')
  const [updateErrMsg, setUpdateErrMsg] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [result, setResult] = useState<ResultFormType<TransactionReceipt>>()

  const generateKey = (): void => {
    const key = caver.wallet.keyring.generateSingleKey()
    setPrivateKey(key)
  }

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

  const { data: accountInfo, refetch } = useQuery(
    [keyring],
    async () => {
      if (keyring) {
        const accountKey = await caver.rpc.klay.getAccountKey(keyring.address)
        const hexBalance = await caver.rpc.klay.getBalance(keyring.address)
        return {
          accountKey,
          klay_balance: caver.utils.fromPeb(hexBalance, 'KLAY'),
          address: keyring.address,
          publicKey: keyring.getPublicKey(),
        }
      }
    },
    {
      enabled: !!keyring,
    }
  )

  const updateKeyring = async (): Promise<void> => {
    setResult(undefined)
    try {
      if (keyring) {
        setIsUpdating(true)
        caver.wallet.add(keyring)
        const account = keyring.toAccount()
        const accountUpdate = caver.transaction.accountUpdate.create({
          from: keyring.address,
          account,
          gas: 5000000,
        })

        await caver.wallet.sign(keyring.address, accountUpdate)
        const receipt = await caver.rpc.klay.sendRawTransaction(accountUpdate)

        caver.wallet.remove(keyring.address)
        setResult({
          success: true,
          value: receipt,
        })
        refetch()
      }
    } catch (error) {
      setResult({
        success: false,
        message: _.toString(error),
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">AccountKeyPublic</h3>
          <Text>Here you can update your account on chain as a public</Text>
        </CardHeader>
        <CardBody>
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
            <Button onClick={generateKey}>Generate a private key</Button>
            <CodeBlock
              title="caver-js code"
              text={`const privateKey = caver.wallet.keyring.generateSingleKey()
const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
            />
          </CardSection>

          {accountInfo && (
            <CardSection>
              <Label>Info of private key</Label>
              <View style={{ paddingBottom: 10 }}>
                <CodeBlock
                  text={JSON.stringify(accountInfo, null, 2)}
                  toggle={false}
                />
              </View>
              {UTIL.toBn(accountInfo.klay_balance).gt(0) ? (
                <Button onClick={updateKeyring} disabled={isUpdating}>
                  {isUpdating ? <Loading size={16} /> : 'Update as public'}
                </Button>
              ) : (
                <>
                  <LinkA link="https://baobab.wallet.klaytn.foundation/faucet">
                    <Row style={{ gap: 4, alignItems: 'center' }}>
                      <Text style={{ color: COLOR.primary }}>
                        1. Get some testnet KLAY to send the update transaction
                      </Text>
                      <Button
                        size="sm"
                        onClick={(): void => {
                          refetch()
                        }}
                      >
                        Move to get faucet
                      </Button>
                    </Row>
                  </LinkA>
                  <Row style={{ gap: 4, alignItems: 'center' }}>
                    <Text>Address : </Text>
                    <View style={{ flex: 1 }}>
                      <CodeBlock text={accountInfo.address} toggle={false} />
                    </View>
                  </Row>
                  <Row style={{ gap: 4, alignItems: 'center' }}>
                    <Text style={{ color: COLOR.primary }}>
                      2. Account info will be updated after get some klay. or
                    </Text>
                    <Button
                      size="sm"
                      onClick={(): void => {
                        refetch()
                      }}
                    >
                      Refetch account info
                    </Button>
                  </Row>
                </>
              )}
              {updateErrMsg && (
                <Text style={{ color: COLOR.error }}> {updateErrMsg} </Text>
              )}
              <CodeBlock
                title="caver-js code"
                text={`const accountKey = await caver.rpc.klay.getAccountKey(keyring.address)
const hexBalance = await caver.rpc.klay.getBalance(keyring.address)
return {
  accountKey,
  klay_balance: caver.utils.fromPeb(hexBalance, 'KLAY'),
  address: keyring.address,
  publicKey: keyring.getPublicKey(),
}`}
              />
            </CardSection>
          )}
          <ResultForm title={'Recipt of transaction'} result={result} />
        </CardBody>
      </Card>
    </Column>
  )
}

export default AccountKeyPublic
