import styled from 'styled-components'
import Web3 from 'web3'
import Web3Modal from '@klaytn/web3modal'
import { KaikasWeb3Provider } from '@klaytn/kaikas-web3-provider'
import { KlipWeb3Provider } from '@klaytn/klip-web3-provider'
import { Component } from 'react'
import _ from 'lodash'
import {
  Button,
  Card,
  FormGroup,
  CardHeader,
  CardBody,
} from 'reactstrap'
import {
  getChainData,
  apiGetAccountAssets,
} from './helpers/utilities'

import Header from './components/Header'
import Loader from './components/Loader'
import AccountAssets from './components/AccountAssets'
import ModalResult from './components/ModalResult'
import Modal from './components/Modal'
import Column from './components/Column'
import {
  KIP17_DEPLOY_NFT,
  KIP17_TRANSFER_FROM,
  KIP17_MINT_NFT
} from './constants'
import { InputField } from 'components'
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

const SLanding = styled(Column)`
  height: 400px;
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
`

const STestButton = styled(Button)`
  border-radius: 8px;
  height: 44px;
  width: 100%;
  max-width: 220px;
  font-size: 12px;
`

const INITIAL_STATE = {
  fetching: false,
  address: '',
  web3: null,
  provider: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  assets: [],
  showModal: false,
  pendingRequest: false,
  result: null,
  contractAddressForTransfer: '',
  tokenIdForTransfer: '',
  kip17name: '',
  kip17symbol: '',
  toAddressForMint: '',
  tokenIdForMint: '',
  tokenURIForMint: '',
  contractAddressForMint: '',
  toAddressForTransfer: ''
}

function initWeb3(provider) {
  const web3 = new Web3(provider)

  web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  })

  return web3
}

const isHexString = function (hex) {
  return (
    (_.isString(hex) || _.isNumber(hex)) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex)
  )
}
class web3modalNFT extends Component {
  constructor(props) {
    super(props)
    this.state = { ...INITIAL_STATE }
    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: false,
      providerOptions: this.getProviderOptions(),
    })
  }

  componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect()
    }
  }

  onConnect = async () => {
    const provider = await this.web3Modal.connect()

    await this.subscribeProvider(provider)

    await provider.enable()
    const web3 = initWeb3(provider)

    const accounts = await web3.eth.getAccounts()

    const address = accounts[0]

    const networkId = await web3.eth.net.getId()

    const chainId = await web3.eth.chainId()

    this.setState({
      web3,
      provider,
      connected: true,
      address,
      chainId,
      networkId,
    })

    await this.getAccountAssets()
  }

  subscribeProvider = async (provider) => {
    if (!provider.on) {
      return
    }
    provider.on('close', () => this.resetApp())
    provider.on('accountsChanged', async (accounts) => {
      this.setState({ address: accounts[0] })
      this.getAccountAssets()
    })
    provider.on('chainChanged', async (chainId) => {
      const { web3 } = this.state
      const networkId = await web3.eth.net.getId()
      chainId = isHexString(chainId) ? Number(chainId).toString() : chainId
      this.setState({ chainId: Number(chainId), networkId })
      await this.getAccountAssets()
    })
    provider.on('networkChanged', async (networkId) => {
      const { web3 } = this.state
      const chainId = await web3.eth.chainId()
      this.setState({ chainId, networkId })
      await this.getAccountAssets()
    })
  }

  getNetwork = () => getChainData(this.state.chainId).network

  getProviderOptions = () => {
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

  getAccountAssets = async () => {
    const { address, chainId } = this.state
    this.setState({ fetching: true })
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId)

      this.setState({ fetching: false, assets })
    } catch (error) {
      console.error(error)
      this.setState({ fetching: false })
    }
  }

  toggleModal = () => this.setState({ showModal: !this.state.showModal })

  onChangeInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }


  testContractCall = async (functionSig) => {
    let contractCall = null
    switch (functionSig) {
      case KIP17_TRANSFER_FROM:
        contractCall = callTransferFrom
        break
      case KIP17_DEPLOY_NFT:
        contractCall = callDeployNFT
        break
      case KIP17_MINT_NFT:
        contractCall = callMintNFT
        break
      default:
        break
    }

    const { web3, address, chainId, contractAddressForTransfer, tokenIdForTransfer, kip17name,
      kip17symbol, toAddressForTransfer, toAddressForMint, tokenIdForMint, tokenURIForMint, contractAddressForMint} = this.state

    try {
      // open modal
      this.toggleModal()

      // check if address is entered
      if (!contractCall && (contractAddressForMint === '' || contractAddressForTransfer === '' || toAddressForMint === '' || toAddressForTransfer === '')) {
        throw new Error(
          `Address should be entered.`
        )
      }

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      // send transaction
      let result
      if (KIP17_TRANSFER_FROM === functionSig) {
        result = await contractCall(address, chainId, contractAddressForTransfer, web3, toAddressForTransfer, tokenIdForTransfer)
      }
      else if (KIP17_DEPLOY_NFT === functionSig) {
        result = await contractCall(address, chainId, web3, kip17name, kip17symbol)
      }
      else if (KIP17_MINT_NFT === functionSig) {
        result = await contractCall(address, chainId, contractAddressForMint, web3, toAddressForMint, tokenIdForMint, tokenURIForMint)
      }

      // format displayed result
      const formattedResult = {
        action: functionSig,
        result,
      }

      // display result
      this.setState({
        web3,
        pendingRequest: false,
        result: formattedResult || null,
      })
    } catch (error) {
      console.error(error) // tslint:disable-line
      this.setState({ web3, pendingRequest: false, result: null })
    }
  }

  resetApp = async () => {
    const { web3 } = this.state
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close()
    }
    await this.web3Modal.clearCachedProvider()
    this.setState({ ...INITIAL_STATE })
  }

  render = () => {
    const {
      assets,
      address,
      connected,
      chainId,
      fetching,
      showModal,
      pendingRequest,
      result,
      kip17name,
      kip17symbol,
      contractAddressForTransfer,
      toAddressForTransfer,
      tokenIdForTransfer,
      toAddressForMint,
      tokenIdForMint,
      tokenURIForMint,
      contractAddressForMint
    } = this.state
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : !!assets && !!assets.length ? (
              <SBalances>
                <h3>Balances</h3>
                <AccountAssets chainId={chainId} assets={assets} />{' '}
                <Card>
                  <CardHeader>
                    <h3 className="title"> Deploy NFT (KIP-17)</h3>
                  </CardHeader>
                  <CardBody>
                    <Column center>
                      <FormGroup style={{ width: '440px' }}>
                        <InputField
                          label={'NFT Name'}
                          placeholder={'NFT Name (ex: Test)'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={kip17name}
                          name='kip17name'
                        />
                        <InputField
                          label={'NFT Symbol'}
                          placeholder={'NFT Symbol (ex: TST)'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={kip17symbol}
                          name='kip17symbol'
                        />
                      </FormGroup>
                      <STestButtonContainer>
                        <STestButton
                          onClick={() => this.testContractCall(KIP17_DEPLOY_NFT)}
                        >
                          {KIP17_DEPLOY_NFT}
                        </STestButton>
                      </STestButtonContainer>
                    </Column>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader>
                    <h3 className="title">Mint NFT (KIP-17)</h3>
                  </CardHeader>
                  <CardBody>
                    <Column center>
                      <FormGroup style={{ width: '440px' }}>
                        <InputField
                          label={'Contract Address'}
                          placeholder={'Contract Address'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={contractAddressForMint}
                          name='contractAddressForMint'
                        />
                        <InputField
                          label={'Recipient'}
                          placeholder={'Account Address'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={toAddressForMint}
                          name='toAddressForMint'
                        />
                        <InputField
                          label={'Token ID'}
                          placeholder={'Token ID'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={tokenIdForMint}
                          name='tokenIdForMint'
                        />
                        <InputField
                          label={'Token URI'}
                          placeholder={'Token URI'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={tokenURIForMint}
                          name='tokenURIForMint'
                        />
                      </FormGroup>
                      <STestButtonContainer>
                        <STestButton
                          onClick={() => this.testContractCall(KIP17_MINT_NFT)}
                        >
                          {KIP17_MINT_NFT}
                        </STestButton>
                      </STestButtonContainer>
                    </Column>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader>
                    <h3>Transfer NFT (KIP-17)</h3>
                  </CardHeader>
                  <CardBody>
                    <Column center>
                      <FormGroup style={{ width: '440px' }}>
                        <InputField
                          label={'Contract Address'}
                          placeholder={'Token Contract Address'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={contractAddressForTransfer}
                          name='contractAddressForTransfer'
                        />
                        <InputField
                          label={'Recipient'}
                          placeholder={'Account Address'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={toAddressForTransfer}
                          name='toAddressForTransfer'
                        />
                        <InputField
                          label={'Token ID'}
                          placeholder={'Token ID'}
                          onChange={(e) => this.onChangeInput(e)}
                          value={tokenIdForTransfer}
                          name='tokenIdForTransfer'
                        />
                      </FormGroup>
                      <STestButtonContainer>
                        <STestButton
                          onClick={() => this.testContractCall(KIP17_TRANSFER_FROM)}
                        >
                          {KIP17_TRANSFER_FROM}
                        </STestButton>
                      </STestButtonContainer>
                    </Column>
                  </CardBody>
                </Card>
              </SBalances>
            ) : (
              <SLanding center>
                <h2>{`Deploy, Mint, and Transfer NFT`}</h2>
                <Button onClick={this.onConnect}> Connect </Button>
              </SLanding>
            )}
          </SContent>
        </Column>
        <Modal show={showModal} toggleModal={this.toggleModal}>
          {pendingRequest ? (
            <SModalContainer>
              <SModalTitle>{'Pending Call Request'}</SModalTitle>
              <SContainer>
                <Loader />
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
            </SModalContainer>
          )}
        </Modal>
      </SLayout>
    )
  }
}
export default web3modalNFT
