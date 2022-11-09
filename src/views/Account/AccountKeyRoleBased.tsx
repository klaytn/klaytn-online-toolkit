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

const StyledRoleLayout = styled(View)`
  display: grid;
  gap: 8px;
  grid-template-columns: 160px 1fr;
  border-bottom: 1px solid gray;
  padding: 10px 0 0;
  margin-bottom: 10px;
`

const SELECT_THRESHOLD_ITEMLIST = _.times(6, (index) => {
  const value = index + 1
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

enum RoleEnum {
  RoleTransaction = 0,
  RoleAccountUpdate = 1,
  RoleFeePayer = 2,
}

const AccountKeyRoleBased = (): ReactElement => {
  const caver = useMemo(() => new Caver(URLMAP.network['testnet']['rpc']), [])
  const [keyring, setKeyring] = useState<Keyring>()
  const useAccountsReturn = useAccounts({
    caver,
    keyring,
  })

  const { accountInfo, refetchAccountInfo } = useAccountsReturn
  const privateKey = keyring && 'key' in keyring ? keyring.key : ''

  const [numOfRoleKey, setNumOfRoleKey] = useState<Record<RoleEnum, number>>({
    [RoleEnum.RoleTransaction]: 1,
    [RoleEnum.RoleAccountUpdate]: 1,
    [RoleEnum.RoleFeePayer]: 1,
  })
  const [threshold, setThreshold] = useState<Record<RoleEnum, number>>({
    [RoleEnum.RoleTransaction]: 1,
    [RoleEnum.RoleAccountUpdate]: 1,
    [RoleEnum.RoleFeePayer]: 1,
  })
  const [weights, setWeights] = useState<Record<RoleEnum, number[]>>({
    [RoleEnum.RoleTransaction]: [1, 1],
    [RoleEnum.RoleAccountUpdate]: [1, 1],
    [RoleEnum.RoleFeePayer]: [1, 1],
  })

  const [newPrivateKeyList, setNewPrivateKeyList] = useState<
    Record<RoleEnum, string[]>
  >({
    [RoleEnum.RoleTransaction]: [],
    [RoleEnum.RoleAccountUpdate]: [],
    [RoleEnum.RoleFeePayer]: [],
  })

  const [password, setPassword] = useState('')
  const [keystoreV4, setKeystoreV4] = useState<EncryptedKeystoreV4Json>()

  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [result, setResult] = useState<ResultFormType<TransactionReceipt>>()

  const generateNewKeys = (): void => {
    const newObj = {
      [RoleEnum.RoleTransaction]: _.times(
        numOfRoleKey[RoleEnum.RoleTransaction],
        () => generateSingleKey()
      ),
      [RoleEnum.RoleAccountUpdate]: _.times(
        numOfRoleKey[RoleEnum.RoleAccountUpdate],
        () => generateSingleKey()
      ),
      [RoleEnum.RoleFeePayer]: _.times(
        numOfRoleKey[RoleEnum.RoleFeePayer],
        () => generateSingleKey()
      ),
    }

    setNewPrivateKeyList(newObj)
  }

  const { newKeyring, newKeyringErrMsg } = useMemo(() => {
    if (keyring && _.some(newPrivateKeyList, (x) => x.length > 0)) {
      try {
        const roleTransactionKeys = _.times(
          numOfRoleKey[RoleEnum.RoleTransaction],
          (index) => newPrivateKeyList[RoleEnum.RoleTransaction][index]
        )
        const roleAccountUpdate = _.times(
          numOfRoleKey[RoleEnum.RoleAccountUpdate],
          (index) => newPrivateKeyList[RoleEnum.RoleAccountUpdate][index]
        )
        const roleFeePayer = _.times(
          numOfRoleKey[RoleEnum.RoleFeePayer],
          (index) => newPrivateKeyList[RoleEnum.RoleFeePayer][index]
        )

        return {
          newKeyring: caver.wallet.keyring.create(keyring.address, [
            roleTransactionKeys,
            roleAccountUpdate,
            roleFeePayer,
          ]),
        }
      } catch (error) {
        return {
          newKeyringErrMsg: _.toString(error),
        }
      }
    }
    return {}
  }, [keyring, newPrivateKeyList, numOfRoleKey])

  const updateKeyring = async (): Promise<void> => {
    setResult(undefined)
    try {
      if (keyring && newKeyring) {
        setIsUpdating(true)
        caver.wallet.add(keyring)
        const account = newKeyring.toAccount([
          {
            threshold: Number(threshold[RoleEnum.RoleTransaction]),
            weight: _.map(weights[RoleEnum.RoleTransaction], (w) => Number(w)),
          },
          {
            threshold: Number(threshold[RoleEnum.RoleAccountUpdate]),
            weight: _.map(weights[RoleEnum.RoleAccountUpdate], (w) =>
              Number(w)
            ),
          },
          {
            threshold: Number(threshold[RoleEnum.RoleFeePayer]),
            weight: _.map(weights[RoleEnum.RoleFeePayer], (w) => Number(w)),
          },
        ])
        const accountUpdate = caver.transaction.accountUpdate.create({
          from: keyring.address,
          account,
          gas: 300000,
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

  const RolePrivateKeyItem = ({
    title,
    role,
  }: {
    title: string
    role: RoleEnum
  }): ReactElement => {
    return (
      <StyledRoleLayout>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: 600, fontSize: 18 }}>{title}</Text>
        </View>
        <StyledNewPrivateKeyBox>
          <View style={{ gap: 4 }}>
            <Text>Threshold</Text>
            <FormSelect
              itemList={SELECT_THRESHOLD_ITEMLIST}
              defaultValue={threshold[role]}
              onChange={(value) => {
                setThreshold((ori) => ({ ...ori, [role]: value }))
              }}
              containerStyle={{ width: 200 }}
            />
          </View>
          <View style={{ gap: 4 }}>
            <Text>Number of private keys</Text>
            <FormRadio
              itemList={[
                { title: '1', value: 1 },
                { title: '2', value: 2 },
                { title: '3', value: 3 },
              ]}
              selectedValue={numOfRoleKey[role]}
              onClick={(value) => {
                setNumOfRoleKey((ori) => ({ ...ori, [role]: value }))
              }}
            />
          </View>
          <View style={{ gap: 4 }}>
            <StyledNewPrivateKeyGrid>
              <Text>Weight</Text>
              <Text>Private Key</Text>
            </StyledNewPrivateKeyGrid>
            {_.times(numOfRoleKey[role], (index): ReactElement => {
              const setNewPrivateKey = (value: string) =>
                setNewPrivateKeyList((oriList) => {
                  const newList = { ...oriList }
                  newList[role][index] = value
                  return newList
                })

              const setWeight = (value: number) =>
                setWeights((oriList) => {
                  const newList = { ...oriList }
                  newList[role][index] = value
                  return newList
                })

              return (
                <StyledNewPrivateKeyGrid
                  key={`newPrivateKeyList-${index}`}
                  style={{ gap: 8 }}
                >
                  <FormSelect
                    itemList={SELECT_WEIGHT_ITEMLIST}
                    defaultValue={weights[role][index]}
                    onChange={setWeight}
                    containerStyle={{ width: '100%' }}
                  />
                  <FormInput
                    value={newPrivateKeyList[role][index] || ''}
                    onChange={setNewPrivateKey}
                    placeholder="Input new private Key"
                    readonly={isUpdated}
                  />
                </StyledNewPrivateKeyGrid>
              )
            })}
          </View>
        </StyledNewPrivateKeyBox>
      </StyledRoleLayout>
    )
  }

  useEffect(() => {
    const newWeights = _.reduce(
      numOfRoleKey,
      (res, curr, index) => {
        const role = index as any as RoleEnum
        res[role] = _.times(curr, (index) => {
          return weights[role][index] || 1
        })

        return res
      },
      weights
    )

    setWeights(newWeights)
  }, [numOfRoleKey])

  useEffect(() => {
    setResult(undefined)
  }, [privateKey])

  useEffect(() => {
    setKeystoreV4(undefined)
  }, [password])

  return (
    <Column>
      <Card>
        <CardHeader>
          <h3 className="title">
            Update AccountKey to RoleBased (AccountKeyRoleBased)
          </h3>
          <Text>
            {`Klaytn provides decoupled keys from addresses, so that you can update your keys in the account. 
This page can be used to update account keys to `}
            <LinkA link="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyrolebased">
              [Docs : AccountKeyRoleBased]
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

                  <StyledRoleLayout>
                    <Text style={{ fontWeight: 600 }}>Role</Text>
                    <Text style={{ fontWeight: 600 }}>Setting</Text>
                  </StyledRoleLayout>
                  <RolePrivateKeyItem
                    title="Transaction"
                    role={RoleEnum.RoleTransaction}
                  />
                  <RolePrivateKeyItem
                    title="AccountUpdate"
                    role={RoleEnum.RoleAccountUpdate}
                  />
                  <RolePrivateKeyItem
                    title="FeePayer"
                    role={RoleEnum.RoleFeePayer}
                  />

                  {false === isUpdated && (
                    <Button
                      onClick={(): void => generateNewKeys()}
                      disabled={isUpdating}
                    >
                      Generate private keys for account update
                    </Button>
                  )}
                  {newKeyringErrMsg && (
                    <Text style={{ color: COLOR.error }}>
                      {newKeyringErrMsg}
                    </Text>
                  )}
                  <CodeBlock
                    title="caver-js code"
                    text={`const roleTransactionKeys: string[]
const roleAccountUpdate: string[]
const roleFeePayer: string[]
                    
const newKeyring = caver.wallet.keyring.create(keyring.address, [
 roleTransactionKeys,
 roleAccountUpdate,
 roleFeePayer,
])`}
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
                      text={`import { WeightedMultiSigOptions } from 'caver-js'
const weightedMultiSigOptions: WeightedMultiSigOptions

caver.wallet.add(keyring)
const account = newKeyring.toAccount(weightedMultiSigOptions)
const accountUpdate = caver.transaction.accountUpdate.create({
  from: keyring.address,
  account,
  gas: 300000,
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
    </Column>
  )
}

export default AccountKeyRoleBased
