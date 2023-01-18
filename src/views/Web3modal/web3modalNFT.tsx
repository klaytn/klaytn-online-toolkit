import { ReactElement, useEffect, useState } from 'react'
import styled from 'styled-components'
import Web3 from 'web3'
import Web3Modal from '@klaytn/web3modal'
import { KaikasWeb3Provider } from '@klaytn/kaikas-web3-provider'
import { KlipWeb3Provider } from '@klaytn/klip-web3-provider'
import _ from 'lodash'
import { isMobile } from 'react-device-detect'

import {
  Button,
  Container,
  Card,
  CardHeader,
  CardBody,
  Label,
  FormInput,
  CardSection,
  Loading,
  View,
  LinkA,
} from 'components'
import { IAssetData } from 'types'
import { WEB3MODAL } from 'consts'
import {
  Header,
  AccountAssets,
  ModalResult,
  Modal,
} from './web3modalComponents'
import { getChainData, apiGetAccountAssets } from './helpers/utilities'
import { callTransferFrom, callDeployNFT, callMintNFT } from './helpers/web3'

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

const SFormInput = styled(FormInput)`
  margin-bottom: 10px;
`

const Web3modalNFT = (): ReactElement => {
  const [chainId, setChainId] = useState<number>(1)
  const [networkId, setNetworkId] = useState<number>(1)
  const [connected, setConnected] = useState<boolean>(false)
  const [address, setAddress] = useState('')
  const [fetching, setFetching] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [pendingRequest, setPendingRequest] = useState<boolean>(false)
  const [result, setResult] = useState<any | null>(null)
  const [assets, setAssets] = useState<IAssetData[]>()
  const [web3modal, setWeb3modal] = useState<any>()
  const [web3, setWeb3] = useState<any>()
  const [kip17Name, setKIP17Name] = useState<string>('')
  const [kip17Symbol, setKIP17Symbol] = useState<string>('')
  const [contractAddressForTransfer, setContractAddressForTransfer] =
    useState<string>('')
  const [tokenIdForTransfer, setTokenIdForTransfer] = useState<string>('')
  const [toAddressForTransfer, setToAddressForTransfer] = useState<string>('')
  const [contractAddressForMint, setContractAddressForMint] =
    useState<string>('')
  const [toAddressForMint, setToAddressForMint] = useState<string>('')
  const [tokenIdForMint, setTokenIdForMint] = useState<string>('')
  const [tokenURIForMint, setTokenURIForMint] = useState<string>('')
  const href = window.location.href

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
    setKIP17Name('')
    setKIP17Symbol('')
    setContractAddressForMint('')
    setContractAddressForTransfer('')
    setToAddressForMint('')
    setToAddressForTransfer('')
    setTokenIdForMint('')
    setTokenIdForTransfer('')
    setTokenURIForMint('')
  }

  const testContractCall = async (functionSig: string): Promise<void> => {
    try {
      toggleModal()
      setPendingRequest(true)

      // send transaction
      let result
      if (WEB3MODAL.KIP17_TRANSFER_FROM === functionSig) {
        result = await callTransferFrom(
          address,
          chainId,
          contractAddressForTransfer,
          web3,
          toAddressForTransfer,
          _.toNumber(tokenIdForTransfer)
        )
      } else if (WEB3MODAL.KIP17_DEPLOY_NFT === functionSig) {
        result = await callDeployNFT(
          address,
          chainId,
          web3,
          kip17Name,
          kip17Symbol
        )
      } else if (WEB3MODAL.KIP17_MINT_NFT === functionSig) {
        result = await callMintNFT(
          address,
          chainId,
          contractAddressForMint,
          web3,
          toAddressForMint,
          _.toNumber(tokenIdForMint),
          tokenURIForMint
        )
      }
      const formattedResult = {
        action: functionSig,
        result,
      }

      setPendingRequest(false)
      setResult(formattedResult)
    } catch (error) {
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
                  <h3 className="title"> Deploy NFT (KIP-17)</h3>
                </CardHeader>
                <CardBody>
                  <CardSection>
                    <Label>NFT Name</Label>
                    <SFormInput
                      placeholder={'NFT Name (ex: Test)'}
                      onChange={setKIP17Name}
                      value={kip17Name}
                    />
                    <Label>NFT Symbol</Label>
                    <SFormInput
                      placeholder={'NFT Symbol (ex: TST)'}
                      onChange={setKIP17Symbol}
                      value={kip17Symbol}
                    />
                  </CardSection>

                  <Button
                    onClick={(): Promise<void> =>
                      testContractCall(WEB3MODAL.KIP17_DEPLOY_NFT)
                    }
                  >
                    {WEB3MODAL.KIP17_DEPLOY_NFT}
                  </Button>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="title">Mint NFT (KIP-17)</h3>
                </CardHeader>
                <CardBody>
                  <CardSection>
                    <Label>Contract Address</Label>
                    <SFormInput
                      placeholder={'Contract Address'}
                      onChange={setContractAddressForMint}
                      value={contractAddressForMint}
                    />
                    <Label>Recipient</Label>
                    <SFormInput
                      placeholder={'Account Address'}
                      onChange={setToAddressForMint}
                      value={toAddressForMint}
                    />
                    <Label>Token ID</Label>
                    <SFormInput
                      type="text"
                      placeholder={'Token ID'}
                      onChange={setTokenIdForMint}
                      value={tokenIdForMint}
                    />
                    <Label>Token URI</Label>
                    <SFormInput
                      placeholder={'Token URI'}
                      onChange={setTokenURIForMint}
                      value={tokenURIForMint}
                    />
                  </CardSection>
                  <Button
                    onClick={(): Promise<void> =>
                      testContractCall(WEB3MODAL.KIP17_MINT_NFT)
                    }
                  >
                    {WEB3MODAL.KIP17_MINT_NFT}
                  </Button>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h3>Transfer NFT (KIP-17)</h3>
                </CardHeader>
                <CardBody>
                  <CardSection>
                    <Label>Contract Address</Label>
                    <SFormInput
                      placeholder={'Token Contract Address'}
                      onChange={setContractAddressForTransfer}
                      value={contractAddressForTransfer}
                    />
                    <Label>Recipient</Label>
                    <SFormInput
                      placeholder={'Account Address'}
                      onChange={setToAddressForTransfer}
                      value={toAddressForTransfer}
                    />
                    <Label>Token ID</Label>
                    <SFormInput
                      type="text"
                      placeholder={'Token ID'}
                      onChange={setTokenIdForTransfer}
                      value={tokenIdForTransfer}
                    />
                  </CardSection>
                  <Button
                    onClick={(): Promise<void> =>
                      testContractCall(WEB3MODAL.KIP17_TRANSFER_FROM)
                    }
                  >
                    {WEB3MODAL.KIP17_TRANSFER_FROM}
                  </Button>
                </CardBody>
              </Card>
            </>
          ) : (
            <SLanding>
              <h2>{`Test Web3Modal`}</h2>
              {isMobile && (
                <View style={{ paddingBottom: 10 }}>
                  <LinkA link={`https://app.kaikas.io/u/${href}`}>
                    If using mobile device, please click here to open in-app
                    browser of Kaikas Mobile
                  </LinkA>
                </View>
              )}
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
export default Web3modalNFT
