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

import AddToken from './TxTypes4/AddToken'
import SignMessage from './TxTypes4/SignMessage'

const caver = new Caver(window.klaytn)

const TransactionType = {
  addToken: 'Add Token (Not Tx Type)',
  signMessage: 'Sign Message (Not Tx Type)',
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

const KaikasTutorial4 = (): ReactElement => {
  const [walletStatus, setWalletStatus] = useState<KaikasStatus>(
    KaikasStatus.Normal
  )
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('')
  const [network, setNetwork] = useState('0')
  const [txType, setTxType] = useState('addToken')

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
          <h3 className="title">Kaikas Tutorial 4</h3>
          <Text>
            {'You can test the following functions on this page:\n'}
            <LinkA link="https://docs.kaikas.io/03_best_practices/02_registering_your_token">
              - Add Token (Not Tx Type)
            </LinkA>
            {'\n'}
            <LinkA link="https://docs.kaikas.io/02_api_reference/02_caver_methods#caver.klay.sign">
              - Sign Message (Not Tx Type)
            </LinkA>
            {'\n\n'}
            {'You can get some test KLAY from the '}
            <LinkA link="https://baobab.wallet.klaytn.foundation/faucet">
              faucet
            </LinkA>
            {" and try out the Kaikas' features on the Testnet."}
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
                    containerStyle={{ width: 400 }}
                  />
                </CardSection>

                {txType === 'addToken' && <AddToken />}
                {txType === 'signMessage' && (
                  <SignMessage walletProps={{ walletAddress }} />
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

export default KaikasTutorial4
