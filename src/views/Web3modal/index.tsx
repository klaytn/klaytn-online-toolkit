import { ReactElement, useEffect, useState } from 'react'
import styled from 'styled-components'
import Web3 from 'web3'
import Web3Modal from '@klaytn/web3modal'
import { KaikasWeb3Provider } from '@klaytn/kaikas-web3-provider'
import { KlipWeb3Provider } from '@klaytn/klip-web3-provider'
import _ from 'lodash'
import { TransactionReceipt } from 'web3-core'

import {
  Button,
  Container,
  Card,
  CardHeader,
  CardBody,
  Label,
  FormInput,
  Text,
  LinkA,
  View,
  CardSection,
  Loading,
} from 'components'
import { IAssetData } from 'types'
import { WEB3MODAL } from 'consts'
import {
  apiGetAccountAssets,
  formatTestTransaction,
  getChainData,
  hashPersonalMessage,
  recoverPublicKey,
} from './helpers/utilities'
import {
  Header,
  AccountAssets,
  ModalResult,
  Modal,
} from './web3modalComponents'
import { callBalanceOf, callTransfer } from './helpers/web3'

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`

const SContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`

const SLanding = styled(View)`
  height: 400px;
  align-items: center;
  justify-content: center;
`

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`

const SModalParagraph = styled.p`
  margin-top: 30px;
  color: black;
  font-weight: 400;
`

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 20px;
  gap: 8px;
`

const STestButton = styled(Button)`
  border-radius: 8px;
  height: 44px;
  width: 100%;
  max-width: 220px;
  font-size: 12px;
`

const Web3modalExample = (): ReactElement => {
  const [chainId, setChainId] = useState<number>(1)
  const [networkId, setNetworkId] = useState<number>(1)
  const [connected, setConnected] = useState<boolean>(false)
  const [address, setAddress] = useState('')
  const [fetching, setFetching] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [pendingRequest, setPendingRequest] = useState<boolean>(false)
  const [result, setResult] = useState<any | null>(null)
  const [assets, setAssets] = useState<IAssetData[]>()
  const [kip7ContractAddress, setKip7ContractAddress] = useState('')
  const [web3modal, setWeb3modal] = useState<any>()
  const [web3, setWeb3] = useState<any>()
  const getAccountAssets = async ({
    changedAddress,
    changedChainId,
  }: {
    changedAddress: string
    changedChainId: number
  }): Promise<void> => {
    try {
      setFetching(true)
      const assets = await apiGetAccountAssets(changedAddress, changedChainId)
      setAssets(assets)
      setFetching(false)
    } catch (err) {
      setFetching(false)
    }
  }

  useEffect(() => {
    setWeb3modal(
      new Web3Modal({
        network: getNetwork(),
        cacheProvider: false,
        providerOptions: getProviderOptions(),
      })
    )
  }, [networkId, chainId])

  const initWeb3 = (provider: any): any => {
    const web3: any = new Web3(provider)
    return web3
  }
  const onConnect = async (): Promise<void> => {
    const provider = await web3modal.connect()
    await provider.enable()
    const web3 = initWeb3(provider)
    const accounts = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()
    const chainId = await web3.eth.getChainId()
    setAddress(accounts[0])
    setNetworkId(networkId)
    setChainId(chainId)
    setConnected(true)
    setWeb3(web3)
    await subscribeProvider(provider, web3)
    await getAccountAssets({
      changedAddress: accounts[0],
      changedChainId: chainId,
    })
  }

  const getProviderOptions = (): any => {
    const providerOptions = {
      kaikas: {
        package: KaikasWeb3Provider,
      },
      klip: {
        package: KlipWeb3Provider,
        options: {
          bappName: 'web3Modal Example App',
          rpcUrl: 'https://public-node-api.klaytnapi.com/v1/cypress',
        },
      },
    }
    return providerOptions
  }

  const getNetwork = (): string => getChainData(chainId).network
  const subscribeProvider = async (provider: any, web3: any): Promise<void> => {
    if (!provider.on) {
      return
    }
    provider.on('close', () => resetApp())
    provider.on('accountsChanged', async (accounts: string[]) => {
      setAddress(accounts[0])
      const chainId = await web3.eth.getChainId()
      await getAccountAssets({
        changedAddress: accounts[0],
        changedChainId: chainId,
      })
    })
    provider.on('chainChanged', async (chainId: string) => {
      const networkId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
      setNetworkId(networkId)
      setChainId(_.toNumber(chainId))
      await getAccountAssets({
        changedAddress: accounts[0],
        changedChainId: _.toNumber(chainId),
      })
    })
    provider.on('networkChanged', async (networkId: number) => {
      const chainId = await web3.eth.getChainId()
      const accounts = await web3.eth.getAccounts()
      setNetworkId(networkId)
      setChainId(chainId)
      await getAccountAssets({
        changedAddress: accounts[0],
        changedChainId: chainId,
      })
    })
  }
  const toggleModal = (): void => setShowModal(!showModal)

  const resetApp = async (): Promise<void> => {
    web3modal.clearCachedProvider()
    //Initial state
    setAddress('')
    setAssets([])
    setChainId(1)
    setNetworkId(1)
    setConnected(false)
    setFetching(false)
    setWeb3(null)
    setShowModal(false)
    setPendingRequest(false)
    setResult(null)
    setKip7ContractAddress('')
  }

  const testSendTransaction = async (): Promise<void> => {
    const tx = await formatTestTransaction(address, chainId)
    try {
      toggleModal()
      setPendingRequest(true)

      // send transaction
      const result = await web3.eth
        .sendTransaction(tx)
        .then((receipt: TransactionReceipt) => {
          return receipt
        })
      // get native currency symbol of current chain
      const nativeCurrency = getChainData(chainId).native_currency.symbol
      // format displayed result
      const formattedResult = {
        action: WEB3MODAL.ETH_SEND_TRANSACTION,
        txHash: result.transactionHash,
        from: address,
        to: address,
        value: `${
          chainId === 1001 || chainId === 8217 ? 0.000001 : 0
        } ${nativeCurrency}`,
      }
      setPendingRequest(false)
      setResult(formattedResult || null)
    } catch (err) {
      setPendingRequest(false)
      setResult(null)
    }
  }

  const testSignMessage = async (): Promise<void> => {
    try {
      // test message
      const message = 'My email is john@doe.com - 1537836206101'

      // hash message
      const hash = hashPersonalMessage(message)

      toggleModal()
      setPendingRequest(true)

      // send message
      const result = await web3.eth.sign(hash, address)

      // verify signature
      const signer = recoverPublicKey(result, hash)
      const verified = signer.toLowerCase() === address.toLowerCase()

      // format displayed result
      const formattedResult = {
        action: WEB3MODAL.ETH_SIGN,
        address,
        signer,
        verified,
        result,
      }
      setPendingRequest(false)
      setResult(formattedResult || null)
    } catch (err) {
      setPendingRequest(false)
      setResult(null)
    }
  }

  const testSignPersonalMessage = async (): Promise<void> => {
    try {
      toggleModal()
      setPendingRequest(true)
      const message = 'My email is john@doe.com - 1537836206101'

      const result = await web3.eth.personal.sign(message, address, '')

      // verify signature
      const signer = await web3.eth.personal.ecRecover(message, result)
      const verified = signer.toLowerCase() === address.toLowerCase()

      // format displayed result
      const formattedResult = {
        action: WEB3MODAL.PERSONAL_SIGN,
        address,
        signer,
        verified,
        result,
      }
      setPendingRequest(false)
      setResult(formattedResult || null)
    } catch (err) {
      setPendingRequest(false)
      setResult(null)
    }
  }

  const testContractCall = async (functionSig: string): Promise<void> => {
    try {
      toggleModal()
      setPendingRequest(true)

      // check if address is entered
      if (kip7ContractAddress === '') {
        throw new Error('Please enter token contract address!')
      }

      let contractCall = null
      switch (functionSig) {
        case WEB3MODAL.KIP7_BALANCE_OF:
          contractCall = callBalanceOf
          break
        case WEB3MODAL.KIP7_TRANSFER:
          contractCall = callTransfer
          break
        default:
          throw new Error(
            `No matching contract calls for functionSig=${functionSig}`
          )
      }

      // send transaction
      const result = await contractCall(
        address,
        chainId,
        kip7ContractAddress,
        web3
      )

      // format displayed result
      const formattedResult = {
        action: functionSig,
        result,
      }
      setPendingRequest(false)
      setResult(formattedResult || null)
    } catch (err) {
      setPendingRequest(false)
      setResult(null)
    }
  }

  return (
    <SLayout>
      <Container>
        <Header
          connected={connected}
          address={address}
          chainId={chainId}
          killSession={resetApp}
        />
        <SContent>
          {fetching ? (
            <View>
              <SContainer>
                <Loading />
              </SContainer>
            </View>
          ) : !!assets && !!assets.length ? (
            <>
              <SBalances>
                <h3>Balances</h3>
                <AccountAssets chainId={chainId} assets={assets} />{' '}
              </SBalances>
              <Card>
                <CardHeader>
                  <h3 className="title">Actions</h3>
                </CardHeader>
                <CardBody>
                  <View>
                    <STestButtonContainer>
                      <STestButton onClick={testSendTransaction}>
                        {WEB3MODAL.ETH_SEND_TRANSACTION}
                      </STestButton>
                      <STestButton onClick={testSignMessage}>
                        {WEB3MODAL.ETH_SIGN}
                      </STestButton>
                      <STestButton onClick={testSignPersonalMessage}>
                        {WEB3MODAL.PERSONAL_SIGN}
                      </STestButton>
                    </STestButtonContainer>
                    <Text style={{ padding: '0 120px' }}>
                      Sendtransaction(): send 0.000001 KLAY to the sender
                      account on Klaytn Network(Mainnet, Testnet). On other
                      networks, the amount is zero.{'\n'}
                      eth.sign() allows signing an arbitrary hash, which means
                      it can be used to sign transactions, or any other data,
                      making it a dangerous phishing risk. So Kaikas and Klip
                      don't support that function.
                      <LinkA link="https://docs.metamask.io/guide/signing-data.html#a-brief-history">
                        [Ref]
                      </LinkA>
                    </Text>
                  </View>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h3>KIP-7 Token</h3>
                  <Text>
                    Check{' '}
                    <LinkA link="/klaytn-online-toolkit/smartcontract/KCTDetection">
                      here
                    </LinkA>{' '}
                    which KCT the smart contract implements by using Contract
                    Address.
                  </Text>
                </CardHeader>
                <CardBody>
                  <CardSection>
                    <Label>Token Contract Address</Label>
                    <FormInput
                      placeholder={'Token Contract Address'}
                      onChange={setKip7ContractAddress}
                      value={kip7ContractAddress}
                    />
                  </CardSection>
                  <STestButtonContainer>
                    <STestButton
                      onClick={(): Promise<void> =>
                        testContractCall(WEB3MODAL.KIP7_BALANCE_OF)
                      }
                    >
                      {WEB3MODAL.KIP7_BALANCE_OF}
                    </STestButton>
                    <STestButton
                      onClick={(): Promise<void> =>
                        testContractCall(WEB3MODAL.KIP7_TRANSFER)
                      }
                    >
                      {WEB3MODAL.KIP7_TRANSFER}
                    </STestButton>
                  </STestButtonContainer>
                </CardBody>
              </Card>
            </>
          ) : (
            <SLanding>
              <h2>{`Test Web3Modal`}</h2>
              <Button onClick={onConnect}> Connect </Button>
            </SLanding>
          )}
        </SContent>
      </Container>
      <Modal show={showModal} toggleModal={toggleModal}>
        {pendingRequest ? (
          <SModalContainer>
            <SModalTitle>{'Pending Call Request'}</SModalTitle>
            <SContainer>
              <Loading />
              <SModalParagraph>
                {'Approve or reject request using your wallet'}
              </SModalParagraph>
            </SContainer>
          </SModalContainer>
        ) : result ? (
          <SModalContainer>
            <SModalTitle>{'Call Request Approved'}</SModalTitle>
            <ModalResult>{result}</ModalResult>
          </SModalContainer>
        ) : (
          <SModalContainer>
            <SModalTitle>{'Call Request Rejected'}</SModalTitle>
            <ModalResult>{result}</ModalResult>
          </SModalContainer>
        )}
      </Modal>
    </SLayout>
  )
}

export default Web3modalExample
