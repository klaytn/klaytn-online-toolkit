import { ReactElement, useState, useEffect } from 'react'
import Caver from 'caver-js'
import _ from 'lodash'

import {
  Card,
  CardHeader,
  CardBody,
  Label,
  Container,
  Text,
  FormSelect,
  FormInput,
  CardSection,
  LinkA,
  View,
  PrivateKeyWarning,
} from 'components'

import ValueTransfer from './TxTypes2/ValueTransfer'
import ValueTransferFeeDelegation from './TxTypes2/ValueTransferFeeDelegation'
import ValueTransferFeeDelegationWithRatio from './TxTypes2/ValueTransferFeeDelegationWithRatio'
import ValueTransferWithMemo from './TxTypes2/ValueTransferWithMemo'
import ValueTransferWithMemoFeeDelegation from './TxTypes2/ValueTransferWithMemoFeeDelegation'
import ValueTransferWithMemoFeeDelegationWithRatio from './TxTypes2/ValueTransferWithMemoFeeDelegationWithRatio'

const caver = new Caver(window.klaytn)

const TransactionType = {
  valueTransfer: 'Value Transfer',
  valueTransferFeeDelegation: 'Value Transfer (Fee Delegation)',
  valueTransferFeeDelegationWithRatio:
    'Value Transfer (Fee Delegation with Ratio)',
  valueTransferWithMemo: 'Value Transfer with Memo',
  valueTransferWithMemoFeeDelegation:
    'Value Transfer with Memo (Fee Delegation)',
  valueTransferWithMemoFeeDelegationWithRatio:
    'Value Transfer with Memo (Fee Delegation with Ratio)',
}

const NetworkName: { [key: string]: string } = {
  '1001': 'Testnet',
  '8217': 'Mainnet',
  '0': 'Not Connected',
}

enum KaikasStatus {
  'Normal',
  'InstallationRequired',
  'DeniedConnection',
}

const KaikasTutorial2 = (): ReactElement => {
  const [walletStatus, setWalletStatus] = useState<KaikasStatus>(
    KaikasStatus.Normal
  )
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('')
  const [network, setNetwork] = useState('0')
  const [txType, setTxType] = useState('valueTransfer')

  const setNetworkInfo = (): void => {
    const { klaytn } = window
    if (klaytn) {
      setNetwork(klaytn.networkVersion)
    } else {
      setWalletStatus(KaikasStatus.InstallationRequired)
    }
  }

  const setAccountInfo = async (): Promise<void> => {
    const { klaytn } = window
    if (klaytn) {
      const account = klaytn.selectedAddress
      const balance = await caver.klay.getBalance(account)
      setWalletAddress(account)
      setWalletBalance(caver.utils.fromPeb(balance, 'KLAY'))
    } else {
      setWalletStatus(KaikasStatus.InstallationRequired)
    }
  }

  const initialized = async (): Promise<void> => {
    const { klaytn } = window
    if (klaytn) {
      try {
        await klaytn.enable()
        setNetworkInfo()
        klaytn.on('networkChanged', () => {
          setNetworkInfo()
          setAccountInfo()
        })
        setAccountInfo()
        klaytn.on('accountsChanged', () => {
          setAccountInfo()
        })
      } catch {
        setWalletStatus(KaikasStatus.DeniedConnection)
      }
    } else {
      setWalletStatus(KaikasStatus.InstallationRequired)
    }
  }

  useEffect(() => {
    initialized()
  }, [])

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3 className="title">Kaikas Tutorial 2</h3>
          <Text>
            {
              'You can test the following transaction types on this page:\n - Value Transfer\n'
            }
            {
              ' - Value Transfer (Fee Delegation)\n - Value Transfer (Fee Delegation with Ratio)\n'
            }
            {
              ' - Value Transfer with Memo\n - Value Transfer with Memo (Fee Delegation)\n'
            }
            {' - Value Transfer with Memo (Fee Delegation with Ratio)\n'}
            {'\n'}
            {'You can get some test KLAY from the'}{' '}
            <LinkA link="https://baobab.wallet.klaytn.foundation/faucet">
              faucet
            </LinkA>{' '}
            {"and try out the Kaikas' features on the Testnet."}
          </Text>
          <PrivateKeyWarning />
        </CardHeader>
        <CardBody>
          {walletStatus === KaikasStatus.Normal &&
            NetworkName[network] === 'Testnet' && (
              <>
                <CardSection>
                  <Text>{NetworkName[network]}</Text>
                </CardSection>
                <CardSection>
                  <h4>Connected Wallet Information</h4>
                  <View style={{ rowGap: 10 }}>
                    <View>
                      <Label>Address</Label>
                      <FormInput
                        type="text"
                        placeholder="Please connect the kaikas"
                        onChange={(): void => {}}
                        value={walletAddress}
                      />
                      <Label>Balance</Label>
                      <FormInput
                        type="text"
                        placeholder="Please connect the kaikas"
                        onChange={(): void => {}}
                        value={walletBalance}
                      />
                    </View>
                  </View>
                </CardSection>
                <CardSection>
                  <Label>Transaction Type</Label>
                  <FormSelect
                    defaultValue={txType}
                    itemList={_.map(TransactionType, (key, val) => ({
                      label: key,
                      value: val,
                    }))}
                    onChange={setTxType}
                    containerStyle={{ width: 300 }}
                  />
                </CardSection>
                {txType === 'valueTransfer' && (
                  <ValueTransfer walletProps={{ walletAddress }} />
                )}
                {txType === 'valueTransferFeeDelegation' && (
                  <ValueTransferFeeDelegation walletProps={{ walletAddress }} />
                )}
                {txType === 'valueTransferFeeDelegationWithRatio' && (
                  <ValueTransferFeeDelegationWithRatio
                    walletProps={{ walletAddress }}
                  />
                )}
                {txType === 'valueTransferWithMemo' && (
                  <ValueTransferWithMemo walletProps={{ walletAddress }} />
                )}
                {txType === 'valueTransferWithMemoFeeDelegation' && (
                  <ValueTransferWithMemoFeeDelegation
                    walletProps={{ walletAddress }}
                  />
                )}
                {txType === 'valueTransferWithMemoFeeDelegationWithRatio' && (
                  <ValueTransferWithMemoFeeDelegationWithRatio
                    walletProps={{ walletAddress }}
                  />
                )}
              </>
            )}
          {walletStatus === KaikasStatus.Normal &&
            NetworkName[network] === 'Mainnet' && (
              <CardSection>
                <Text>
                  Please change the network to Testnet in the Kaikas wallet.
                </Text>
              </CardSection>
            )}
          {walletStatus === KaikasStatus.InstallationRequired && (
            <CardSection>
              <Text>
                {
                  'You must download the Kaikas to use this page. Kaikas is a browser extension that provides secure '
                }
                {
                  'and usable means to interact with Klaytn network from web sites. In particular, it handles account '
                }
                {'management and connecting the user to the blockchain. \n\n'}
                {
                  'Kaikas supports Chrome on Windows, Mac, and Linux. You can download it'
                }{' '}
                <LinkA link="https://chrome.google.com/webstore/detail/kaikas/jblndlipeogpafnldhgmapagcccfchpi">
                  here
                </LinkA>
                .
              </Text>
            </CardSection>
          )}
          {walletStatus === KaikasStatus.DeniedConnection && (
            <CardSection>
              <Text>
                You must connect the Kaikas to use this page. Please refresh the
                page and connect the wallet.
              </Text>
            </CardSection>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default KaikasTutorial2
