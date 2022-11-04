import { ReactElement } from 'react'
import _ from 'lodash'

import { COLOR, UTIL } from 'consts'

import {
  Text,
  Button,
  View,
  Label,
  FormInput,
  CodeBlock,
  Row,
  LinkA,
  CardSection,
  FormRadio,
  FormFile,
} from 'components'
import { UseGetKeySectionReturn } from 'views/Account/components/useGetKeySection'
import { UseAccountsReturn } from 'hooks/account/useAccounts'

const GetKeySection = ({
  useGetKeySectionReturn,
  useAccountsReturn,
}: {
  useGetKeySectionReturn: UseGetKeySectionReturn
  useAccountsReturn: UseAccountsReturn
}): ReactElement => {
  const {
    getKeyFrom,
    setGetKeyFrom,
    keystoreJSON,
    keystorePassword,
    setKeystorePassword,
    privateKey,
    setPrivateKey,

    keyring,
    keyringErrMsg,
    handleKeystoreChange,
  } = useGetKeySectionReturn
  const { generateKey, accountInfo, refetchAccountInfo } = useAccountsReturn

  return (
    <>
      <CardSection>
        <Label>Get Key</Label>
        <View style={{ paddingBottom: 10 }}>
          <FormRadio
            itemList={[
              { title: 'private Key', value: 'input' },
              { title: 'keystore', value: 'keystore' },
            ]}
            selectedValue={getKeyFrom}
            onClick={setGetKeyFrom}
          />
        </View>
        {getKeyFrom === 'input' ? (
          <>
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
            <Button onClick={(): void => generateKey(setPrivateKey)}>
              Generate a private key
            </Button>
            <CodeBlock
              title="caver-js code"
              text={`const privateKey = caver.wallet.keyring.generateSingleKey()
const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)`}
            />
          </>
        ) : (
          <>
            <View style={{ paddingBottom: 10 }}>
              <FormFile
                placeholder="Keystore File"
                accept=".json"
                onChange={handleKeystoreChange}
              />
            </View>
            {keystoreJSON && !keyring && (
              <View style={{ paddingBottom: 10 }}>
                <FormInput
                  type="password"
                  value={keystorePassword}
                  onChange={setKeystorePassword}
                  placeholder="Input password"
                />
                {keystorePassword && keyringErrMsg && (
                  <Text style={{ color: COLOR.error }}>{keyringErrMsg}</Text>
                )}
              </View>
            )}
            <CodeBlock
              title="caver-js code"
              text={`const keyring = caver.wallet.keyring.decrypt(keystoreJSON, keystorePassword)`}
            />
          </>
        )}
      </CardSection>
      {keyring && (
        <CardSection>
          <Label>Keyring from key</Label>
          <View style={{ paddingBottom: 10 }}>
            <CodeBlock text={JSON.stringify(keyring, null, 2)} toggle={false} />
          </View>

          {UTIL.toBn(accountInfo?.klay_balance).isLessThan(1) && (
            <>
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
            </>
          )}
        </CardSection>
      )}
    </>
  )
}

export default GetKeySection
