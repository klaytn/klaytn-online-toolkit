import { ReactElement, useEffect, useMemo, useState } from 'react'
import Caver, {
  EncryptedKeystoreV4Json,
  Keyring,
  TransactionReceipt,
} from 'caver-js'
import _ from 'lodash'
import styled from 'styled-components'

import { COLOR, URLMAP, UTIL } from 'consts'

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
  Loading,
  FormDownload,
  FormRadio,
  FormSelect,
  PrivateKeyWarning,
} from 'components'
import { ResultFormType } from 'types'
import GetKeySection from './components/GetKeySection'
import useAccounts from 'hooks/account/useAccounts'
import { generateSingleKey } from 'logics/caverFuncntions'

const StyledNewPrivateKeyBox = styled(View)`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  padding-bottom: 10px;
`

const StyledNewPrivateKeyGrid = styled(View)`
  display: grid;
  gap: 8px;
  grid-template-columns: 80px 1fr;
`

const SELECT_THRESHOLD_ITEMLIST = _.times(6, (index) => {
  const value = index + 2
  return {
    value,
    label: value.toString(),
  }
})

const SELECT_WEIGHT_ITEMLIST = _.times(5, (index) => {
  const value = index + 1
  return {
    value,
    label: value.toString(),
  }
})

const AccountKeyMultiSig = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])
  const [keyring, setKeyring] = useState<Keyring>()
  const useAccountsReturn = useAccounts({
    caver,
    keyring,
  })

  const { accountInfo, refetchAccountInfo } = useAccountsReturn
  const privateKey = keyring && 'key' in keyring ? keyring.key : ''

  const [numOfNewPrivateKey, setNumOfNewPrivateKey] = useState(2)
  const [threshold, setThreshold] = useState(2)
  const [weights, setWeights] = useState<number[]>([1, 1])
  const [newPrivateKeyList, setNewPrivateKeyList] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [keystoreV4, setKeystoreV4] = useState<EncryptedKeystoreV4Json>()

  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [result, setResult] = useState<ResultFormType<TransactionReceipt>>()

  const generateNewKeys = (): void => {
    const generatedList = _.times(numOfNewPrivateKey, () => generateSingleKey())

    setNewPrivateKeyList(generatedList)
  }

  const { newKeyring, newKeyringErrMsg } = useMemo(() => {
    if (keyring && numOfNewPrivateKey <= newPrivateKeyList.length) {
      try {
        return {
          newKeyring: caver.wallet.keyring.create(
            keyring.address,
            _.times(numOfNewPrivateKey, (index) => newPrivateKeyList[index])
          ),
        }
      } catch (error) {
        return {
          newKeyringErrMsg: _.toString(error),
        }
      }
    }
    return {}
  }, [keyring, newPrivateKeyList, numOfNewPrivateKey])

  const updateKeyring = async (): Promise<void> => {
    setResult(undefined)
    try {
      if (keyring && newKeyring) {
        setIsUpdating(true)
        caver.wallet.add(keyring)
        const account = newKeyring.toAccount({
          threshold: Number(threshold),
          weights: _.map(weights, (w) => Number(w)),
        })
        const accountUpdate = caver.transaction.accountUpdate.create({
          from: keyring.address,
          account,
          gas: 200000,
        })

        await caver.wallet.sign(keyring.address, accountUpdate)
        const receipt = await caver.rpc.klay.sendRawTransaction(accountUpdate)

        caver.wallet.remove(keyring.address)
        setResult({
          success: true,
          value: receipt,
        })
        refetchAccountInfo()
        setIsUpdated(true)
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

  const generateKeystore = (): void => {
    if (newKeyring) {
      setKeystoreV4(newKeyring.encrypt(password))
    }
  }

  useEffect(() => {
    const newWeights = _.times(numOfNewPrivateKey, (index) => {
      return weights[index] || 1
    })
    setWeights(newWeights)
  }, [numOfNewPrivateKey])

  useEffect(() => {
    setResult(undefined)
  }, [privateKey])

  useEffect(() => {
    setKeystoreV4(undefined)
  }, [password])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">
            Update AccountKey to MultiSigKey (AccountKeyMultiSig)
          </h3>
          <Text>
            {`Klaytn provides decoupled keys from addresses, so that you can update your keys in the account.
This page can be used to update account keys to `}
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyweightedmultisig">
              [Docs : AccountKeyWeightedMultiSig]
            </LinkA>
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          <CardSection>
            <Text>Testnet</Text>
          </CardSection>
          <GetKeySection
            keyring={keyring}
            setKeyring={setKeyring}
            useAccountsReturn={useAccountsReturn}
          />
          {accountInfo && (
            <>
              <CardSection>
                <Label>
                  Account info of on-chain{' '}
                  {isUpdated && <b style={{ color: 'white' }}>UPDATED !!</b>}
                </Label>
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
              </CardSection>
              {UTIL.toBn(accountInfo.klay_balance).gt(0) && (
                <CardSection>
                  <Label>New private keys</Label>

                  <StyledNewPrivateKeyBox>
                    <View style={{ gap: 4 }}>
                      <Text>Threshold</Text>
                      <FormSelect
                        itemList={SELECT_THRESHOLD_ITEMLIST}
                        defaultValue={threshold}
                        onChange={setThreshold}
                        containerStyle={{ width: 200 }}
                      />
                    </View>
                    <View style={{ gap: 4 }}>
                      <Text>Number of private keys</Text>
                      <FormRadio
                        itemList={[
                          { title: '2', value: 2 },
                          { title: '3', value: 3 },
                          { title: '4', value: 4 },
                          { title: '5', value: 5 },
                        ]}
                        selectedValue={numOfNewPrivateKey}
                        onClick={setNumOfNewPrivateKey}
                      />
                    </View>
                    <View style={{ gap: 4 }}>
                      <StyledNewPrivateKeyGrid>
                        <Text>Weight</Text>
                        <Text>Private Key</Text>
                      </StyledNewPrivateKeyGrid>
                      {_.times(numOfNewPrivateKey, (index): ReactElement => {
                        const setNewPrivateKey = (value: string): void =>
                          setNewPrivateKeyList((oriList) => {
                            const newList = [...oriList]
                            newList[index] = value
                            return newList
                          })

                        const setWeight = (value: number): void =>
                          setWeights((oriList) => {
                            const newList = [...oriList]
                            newList[index] = value
                            return newList
                          })

                        return (
                          <StyledNewPrivateKeyGrid
                            key={`newPrivateKeyList-${index}`}
                            style={{ gap: 8 }}
                          >
                            <FormSelect
                              itemList={SELECT_WEIGHT_ITEMLIST}
                              defaultValue={weights[index] || 1}
                              onChange={setWeight}
                              containerStyle={{ width: '100%' }}
                            />
                            <FormInput
                              value={newPrivateKeyList[index] || ''}
                              onChange={setNewPrivateKey}
                              placeholder="Input new private Key"
                              readonly={isUpdated}
                            />
                          </StyledNewPrivateKeyGrid>
                        )
                      })}
                    </View>
                    {false === isUpdated && (
                      <Button
                        onClick={(): void => generateNewKeys()}
                        disabled={isUpdating}
                      >
                        Generate private keys for account update
                      </Button>
                    )}
                  </StyledNewPrivateKeyBox>
                  {newKeyringErrMsg && (
                    <Text style={{ color: COLOR.error }}>
                      {newKeyringErrMsg}
                    </Text>
                  )}

                  <CodeBlock
                    title="caver-js code"
                    text={`const newPrivateKeys: string[]

const newKeyring = caver.wallet.keyring.create(keyring.address, newPrivateKeys)`}
                  />
                </CardSection>
              )}
              {newKeyring && (
                <>
                  <CardSection>
                    <Label>
                      New keyring (original address + new private keys)
                    </Label>
                    <View style={{ paddingBottom: 10 }}>
                      <CodeBlock
                        text={JSON.stringify(newKeyring, null, 2)}
                        toggle={false}
                      />
                    </View>
                    {false === isUpdated && (
                      <Button
                        onClick={updateKeyring}
                        disabled={isUpdating || !newPrivateKeyList}
                      >
                        {isUpdating ? (
                          <Loading size={16} />
                        ) : (
                          'Update new keyring on chain'
                        )}
                      </Button>
                    )}
                    <CodeBlock
                      title="caver-js code"
                      text={`caver.wallet.add(keyring)
const account = newKeyring.toAccount({
    threshold,
    weights,
})
const accountUpdate = caver.transaction.accountUpdate.create({
  from: keyring.address,
  account,
  gas: 200000,
})
await caver.wallet.sign(keyring.address, accountUpdate)
const receipt = await caver.rpc.klay.sendRawTransaction(accountUpdate)
caver.wallet.remove(keyring.address)`}
                    />
                  </CardSection>
                  {isUpdated && (
                    <CardSection>
                      <Label>Enter the password for the keystore file</Label>
                      <View style={{ paddingBottom: 10 }}>
                        <FormInput
                          value={password}
                          onChange={setPassword}
                          placeholder="Input password"
                        />
                      </View>
                      <Row style={{ gap: 4 }}>
                        <Button onClick={generateKeystore}>
                          generate keystore file
                        </Button>
                        {keystoreV4 && (
                          <FormDownload
                            title="Keystore V4"
                            fileData={JSON.stringify(keystoreV4, null, 2)}
                            fileName={`keystoreV4-${newKeyring.address}`}
                          />
                        )}
                      </Row>
                    </CardSection>
                  )}
                </>
              )}
            </>
          )}

          <ResultForm title={'Receipt of transaction'} result={result} />
        </CardBody>
      </Card>
    </Container>
  )
}

export default AccountKeyMultiSig
