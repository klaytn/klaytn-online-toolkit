import styled from "styled-components";
import Web3 from "web3";
import { convertUtf8ToHex } from "@walletconnect/utils";
import Web3Modal from "@klaytn/web3modal";
import { KaikasWeb3Provider } from "@klaytn/kaikas-web3-provider"
import React, { Component } from "react";
import { Button, Card, FormGroup, Label, Input, CardHeader, CardBody } from "reactstrap";
import {
    formatTestTransaction,
    getChainData,
    apiGetAccountAssets,
    hashPersonalMessage,
    recoverPublicKey,
} from "./helpers/utilities";

import Header from "./components/Header";
import Loader from "./components/Loader";
import AccountAssets from "./components/AccountAssets";
import ModalResult from "./components/ModalResult";
import Modal from "./components/Modal";
import Column from "./components/Column";
import {
    KIP7_BALANCE_OF,
    KIP7_TRANSFER,
    ETH_SEND_TRANSACTION,
    ETH_SIGN,
    PERSONAL_SIGN,
  } from "./constants";
import { callBalanceOf, callTransfer } from "./helpers/web3";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 400px;
`;

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;

const SModalParagraph = styled.p`
  margin-top: 30px;
  color: black;
  font-weight: 400;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const STestButton = styled(Button)`
  border-radius: 8px;
  height: 44px;
  width: 100%;
  max-width: 220px;
  font-size: 12px;
`;

const INITIAL_STATE = {
    fetching: false,
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 1,
    networkId: 1,
    assets: [],
    showModal: false,
    pendingRequest: false,
    result: null,
    contractAddress: ""
};

function initWeb3(provider) {
    const web3 = new Web3(provider);

    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          outputFormatter: web3.utils.hexToNumber
        }
      ]
    });

    return web3;
}

class web3modalExample extends Component{
    constructor(props){
        super(props);
        this.state = {
            fetching: false,
            address: "",
            web3: null,
            provider: null,
            connected: false,
            chainId: 1,
            networkId: 1,
            assets: [],
            showModal: false,
            pendingRequest: false,
            result: null,
            contractAddress: "",
        }
        this.web3Modal = new Web3Modal({
            network: this.getNetwork(),
            cacheProvider: true,
            providerOptions: this.getProviderOptions()
        });

    }

    componentDidMount() {
        if (this.web3Modal.cachedProvider) {
            this.onConnect();
        }
    }

    onConnect = async () => {
        const provider = await this.web3Modal.connect();

        await this.subscribeProvider(provider);

        await provider.enable();
        const web3 = initWeb3(provider);

        const accounts = await web3.eth.getAccounts();

        const address = accounts[0];

        const networkId = await web3.eth.net.getId();

        const chainId = await web3.eth.chainId();

        this.setState({
        web3,
        provider,
        connected: true,
        address,
        chainId,
        networkId
        });

        await this.getAccountAssets();
    }

    subscribeProvider = async (provider) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => this.resetApp());
        provider.on("accountsChanged", async (accounts) => {
            this.setState({ address: accounts[0] });
            this.getAccountAssets();
        });
        provider.on("chainChanged", async (chainId) => {
            const { web3 } = this.state;
            const networkId = await web3.eth.net.getId();
            chainId = isHexString(chainId)? Number(chainId).toString():chainId;
            this.setState({ chainId: Number(chainId), networkId });
            await this.getAccountAssets();
        });
        provider.on("networkChanged", async (networkId) => {
            const { web3 } = this.state;
            const chainId = await web3.eth.chainId();
            this.setState({ chainId, networkId });
            await this.getAccountAssets();
        });
    };

    getNetwork = () => getChainData(this.state.chainId).network;

    getProviderOptions = () => {
        const providerOptions = {
            kaikas: {
                package: KaikasWeb3Provider,
            }
        };
        return providerOptions;
    };

    getAccountAssets = async () => {
        const { address, chainId } = this.state;
        this.setState({ fetching: true });
        try {
        // get account balances
        const assets = await apiGetAccountAssets(address, chainId);

        this.setState({ fetching: false, assets });
        } catch (error) {
            console.error(error);
            this.setState({ fetching: false });
        }
    };

    toggleModal = () => this.setState({ showModal: !this.state.showModal });

    onChangeInput = (e) => {
        this.setState({
            contractAddress: e.target.value
        });
    }

    testSendTransaction = async () => {
        const { web3, address, chainId } = this.state;

        if (!web3) {
            return;
        }

        const tx = await formatTestTransaction(address, chainId);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // @ts-ignore
            function sendTransaction(_tx) {
                return new Promise((resolve, reject) => {
                web3.eth
                    .sendTransaction(_tx)
                    .once("transactionHash", (txHash) => resolve(txHash))
                    .catch((err) => reject(err));
                });
            }

            // send transaction
            const result = await sendTransaction(tx);

            // get native currency symbol of current chain
            const nativeCurrency =  getChainData(this.state.chainId).native_currency.symbol

            // format displayed result
            const formattedResult = {
                action: ETH_SEND_TRANSACTION,
                txHash: result,
                from: address,
                to: address,
                value:`0 ${nativeCurrency}`
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error); // tslint:disable-line
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testSignMessage = async () => {
        const { web3, address } = this.state;

        if (!web3) {
            return;
        }

        // test message
        const message = "My email is john@doe.com - 1537836206101";

        // hash message
        const hash = hashPersonalMessage(message);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send message
            const result = await web3.eth.sign(hash, address);

            // verify signature
            const signer = recoverPublicKey(result, hash);
            const verified = signer.toLowerCase() === address.toLowerCase();

            // format displayed result
            const formattedResult = {
                action: ETH_SIGN,
                address,
                signer,
                verified,
                result
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error); // tslint:disable-line
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testSignPersonalMessage = async () => {
        const { web3, address } = this.state;

        if (!web3) {
            return;
        }

        // test message
        const message = "My email is john@doe.com - 1537836206101";

        // encode message (hex)
        const hexMsg = convertUtf8ToHex(message);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send message
            const result = await web3.eth.personal.sign(hexMsg, address);

            // verify signature
            const signer = await web3.eth.personal.ecRecover(message, result);
            const verified = signer.toLowerCase() === address.toLowerCase();

            // format displayed result
            const formattedResult = {
                action: PERSONAL_SIGN,
                address,
                signer,
                verified,
                result
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error); // tslint:disable-line
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testContractCall = async (functionSig) => {
        let contractCall = null;
        switch (functionSig) {
            case KIP7_BALANCE_OF:
                contractCall = callBalanceOf;
                break;
            case KIP7_TRANSFER:
                contractCall = callTransfer;
                break;
            default:
                break;
        }

        if (!contractCall || contractAddress === "") {
            throw new Error(
                `No matching contract calls for functionSig=${functionSig}`
            );
        }

        const { web3, address, contractAddress, chainId } = this.state;
        try{
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send transaction
            const result = await contractCall(address, chainId, contractAddress, web3);

            // format displayed result
            const formattedResult = {
                action: functionSig,
                result
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error); // tslint:disable-line
            this.setState({ web3, pendingRequest: false, result: null });
        }
    }

    resetApp = async () => {
        const { web3 } = this.state;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await this.web3Modal.clearCachedProvider();
        this.setState({ ...INITIAL_STATE });
    };

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
          contractAddress
        } = this.state;
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
                    <AccountAssets chainId={chainId} assets={assets} />{" "}
                    <Card>
                        <CardHeader>
                            <h3 className="title">Actions</h3>
                        </CardHeader>
                        <CardBody>
                            <Column center>
                            <STestButtonContainer>
                                <STestButton onClick={this.testSendTransaction}>
                                {ETH_SEND_TRANSACTION}
                                </STestButton>
                                <STestButton onClick={this.testSignMessage}>
                                {ETH_SIGN}
                                </STestButton>
                                <STestButton onClick={this.testSignPersonalMessage}>
                                {PERSONAL_SIGN}
                                </STestButton>
                            </STestButtonContainer>
                            </Column>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3>KIP-7 Token</h3>
                            <p>
                                Check <a href="/klaytn-online-toolkit/smartcontract/KCTDetection">here</a> which KCT the smart contract implements by using Contract Address.
                            </p>
                        </CardHeader>
                            <CardBody>
                                <Column center>
                                <FormGroup style={{width: "440px"}}>
                                <Label>
                                    Contract Address
                                </Label>
                                <Input
                                    label={"Token ontract Address"}
                                    placeholder={"Token Contract Address"}
                                    onChange={(e) => this.onChangeInput(e)}
                                    value={contractAddress}
                                />
                                </FormGroup>
                                <STestButtonContainer>
                                    <STestButton onClick={() => this.testContractCall(KIP7_BALANCE_OF)}>
                                    {KIP7_BALANCE_OF}
                                    </STestButton>
                                    <STestButton onClick={() => this.testContractCall(KIP7_TRANSFER)}>
                                    {KIP7_TRANSFER}
                                    </STestButton>
                                </STestButtonContainer>
                            </Column>
                        </CardBody>
                    </Card>
                </SBalances>
                ) : (
                <SLanding center>
                    <h2>{`Test Web3Modal`}</h2>
                    <Button onClick={this.onConnect}> Connect </Button>
                </SLanding>
                )}
            </SContent>
            </Column>
            <Modal show={showModal} toggleModal={this.toggleModal}>
            {pendingRequest ? (
                <SModalContainer>
                <SModalTitle>{"Pending Call Request"}</SModalTitle>
                <SContainer>
                    <Loader />
                    <SModalParagraph>
                    {"Approve or reject request using your wallet"}
                    </SModalParagraph>
                </SContainer>
                </SModalContainer>
            ) : result ? (
                <SModalContainer>
                <SModalTitle>{"Call Request Approved"}</SModalTitle>
                <ModalResult>{result}</ModalResult>
                </SModalContainer>
            ) : (
                <SModalContainer>
                <SModalTitle>{"Call Request Rejected"}</SModalTitle>
                </SModalContainer>
            )}
            </Modal>
        </SLayout>
        );
    };
}
export default web3modalExample;