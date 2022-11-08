import { ReactElement } from 'react'
import _ from 'lodash'
import { Keyring } from 'caver-js'

import { COLOR, UTIL } from 'consts'

import {
  Text,
  Button,
  View,
  Label,
  CodeBlock,
  Row,
  LinkA,
  CardSection,
  FormGetKey,
} from 'components'
import { UseAccountsReturn } from 'hooks/account/useAccounts'

const GetKeySection = ({
  keyring,
  setKeyring,
  useAccountsReturn,
}: {
  keyring?: Keyring
  setKeyring: (value?: Keyring) => void
  useAccountsReturn: UseAccountsReturn
}): ReactElement => {
  const { accountInfo, refetchAccountInfo } = useAccountsReturn

  return (
    <>
      <CardSection>
        <Label>Get Key</Label>
        <FormGetKey keyring={keyring} setKeyring={setKeyring} />
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
