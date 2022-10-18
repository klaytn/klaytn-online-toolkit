import InputField from '../components/inputField';
import React, { Component } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardText,
    Row,
    Col,
    Label,
    FormGroup,
} from "reactstrap";
import Column from '../components/Column';
import { networkLinks } from '../constants/klaytnNetwork';
import Caver from 'caver-js'

let caver;

class KIP17Deploy extends Component {
    constructor(props){
        super(props);
        this.state = {
            network: "mainnet",
            senderAddress: "",
            senderKeystoreJSON: "",
            senderKeystorePassword: "",
            senderDecryptMessage: "",
            senderDecryptMessageVisible: false,
            deployMsg: null,
            deployMsgVisible: false,
            deployButtonDisabled: false,
            tokenName: "",
            tokenSymbol: "",
            contractAddress: "",
            nftReceiver: "",
            tokenURI: "",
            mintMsg: null,
            mintMsgVisible: false,
            mintButtonDisabled: false,
            newTokenId: ""
        }
    }

    componentDidMount(){
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[this.state.network]["rpc"]))
    }

    onInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    handleNetworkChange = (e)=>{
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[e.target.value]["rpc"]))
        this.setState({
            network: e.target.value
        })
    }

    handleSenderKeystoreChange = (e) =>{
        if (e.target.files.length > 0)
        {
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8")
            fileReader.onload = (event) =>{
                const parsedKeystore = JSON.parse(event.target.result)
                this.setState({
                    senderKeystoreJSON: parsedKeystore,
                })
            };
        }
    }

    handleSenderPasswordChange = (e) => {
        const {value} = e.target;
        this.setState({
            senderKeystorePassword: value
        })
    }

    decryptSenderKeystore =(e) => {
        const { senderKeystoreJSON, senderKeystorePassword } = this.state;
        try {
            if (senderKeystoreJSON != null) {
                const keyring = caver.wallet.keyring.decrypt(senderKeystoreJSON, senderKeystorePassword)

                //update wallet
                if(caver.wallet.isExisted(keyring.address)){
                    caver.wallet.updateKeyring(keyring)
                }
                else {
                    caver.wallet.add(keyring)
                }

                this.setState ({
                    senderDecryptMessage: "Decryption succeeds!",
                    senderAddress: keyring.address,
                    senderDecryptMessageVisible: true,
                })

                setTimeout(()=>{
                    this.setState({
                        senderDecryptMessageVisible: false,
                        senderDecryptMessage: ""
                    })
                }, 5000)
            }
        }catch (e){
            this.setState({
                senderDecryptMessage: e.toString(),
                senderDecryptMessageVisible: true,
                senderAddress: ""
            })
            setTimeout(()=>{
                this.setState({
                    senderDecryptMessageVisible: false,
                    senderDecryptMessage: ""
                })
            }, 5000)
        }
    }

    deploy = async (e) => {
        const { senderAddress, tokenName, tokenSymbol } = this.state;
        try {
            if (senderAddress === "") {
                throw Error("Sender Keystore is not uploaded!")
            }

            this.setState({
                deployButtonDisabled: true
            })

            const kip17 = await caver.kct.kip17.deploy({
                name: tokenName,
                symbol: tokenSymbol
            }, { from: senderAddress })

            this.setState({
                deployMsgVisible: true,
                deployMsg: `KIP-17 smart contract is successfully deployed! `,
                deployButtonDisabled: false,
                contractAddress: kip17.options.address
            })
        } catch (e) {
            this.setState({
                deployMsg: e.toString(),
                deployMsgVisible: true,
                deployButtonDisabled: false,
                contractAddress: ""
            })

            setTimeout(()=>{
                this.setState({
                    deployMsgVisible: false,
                    deployMsg: ""
                })
            }, 5000)
        }
    }

    mint = async (e) => {
        const { contractAddress, senderAddress, nftReceiver, tokenURI } = this.state;
        try {
            this.setState({
                mintButtonDisabled: true
            })

            const deployedContract = new caver.kct.kip17(contractAddress);
            deployedContract.options.from = senderAddress;
            const currentTokenId = await deployedContract.totalSupply()
            const minted = await deployedContract.mintWithTokenURI(nftReceiver, currentTokenId, tokenURI);
            const newMintMsg = 'NFT' + '(token ID : ' + currentTokenId + ') is successfully minted!'

            if (minted){
                this.setState({
                    mintMsgVisible: true,
                    mintMsg: newMintMsg,
                    mintButtonDisabled: false,
                    newTokenId: currentTokenId
                })
            } else{
                throw Error("Minting is failed")
            }
        } catch (e) {
            this.setState({
                mintMsg: e.toString(),
                mintMsgVisible: true,
                mintButtonDisabled: false,
                nftReceiver: ""
            })

            setTimeout(()=>{
                this.setState({
                    mintMsgVisible: false,
                    mintMsg: ""
                })
            }, 5000)
        }
    }

    render () {
        const {
            senderKeystorePassword,
            senderDecryptMessage,
            senderDecryptMessageVisible,
            deployMsgVisible,
            deployMsg,
            deployButtonDisabled,
            contractAddress,
            network,
            tokenName,
            tokenSymbol,
            nftReceiver,
            tokenURI,
            mintMsgVisible,
            mintMsg,
            mintButtonDisabled,
            newTokenId
        } = this.state
        return (
            <Column>
                 <Card>
                    <CardHeader>
                        <h3 className="title">Deploy KIP-17 Non-fungible Token (NFT)</h3>
                        <p style={{color:"#6c757d"}}>
                            Here you can deploy a KIP-17 smart contract to the Klaytn Cypress or Baobab network.
                            <a href="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip17#caver-klay-kip17-deploy"> caver.kct.kip17.deploy</a> function is used to deploy a KIP-17 smart contract.
                            After successful deployment, you can find a contract account in Klaytn network explorer.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h3 className='title'> Upload Deployer Keystore File</h3>
                        <p style={{color:"#6c757d"}}>
                            Upload the Keystore file. This account must have enough KLAY to deploy a KIP-17 smart contract.
                        </p>
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <Label> Network </Label>
                                    <select onChange={(e)=>this.handleNetworkChange(e)} className="form-control">
                                        <option value="mainnet"> Mainnet</option>
                                        <option value="testnet"> Testnet</option>
                                    </select>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    name="keystore"
                                    type="file"
                                    id="Keystore"
                                    label="Keystore"
                                    placeholder="Keystore File"
                                    accept=".json"
                                    onChange={(e) => this.handleSenderKeystoreChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    label="Password"
                                    onChange={(e)=> this.handleSenderPasswordChange(e)}
                                    value={senderKeystorePassword}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button onClick={(e)=> this.decryptSenderKeystore(e)}>Decrypt</Button>
                            </Col>
                        </Row>
                        {senderDecryptMessageVisible &&
                            <Row>
                                <Col md="8">
                                    <CardText style={{color:"#c221a9"}}>
                                        {senderDecryptMessage}
                                    </CardText>
                                </Col>
                            </Row>
                        }
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <h3 className='title'>Non-fungible Token (NFT) Information</h3>
                        <p style={{color:"#6c757d"}}>
                            Enter the Non-fungible token (NFT) information: the NFT's name and symbol.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="NFT Name"
                                    type="text"
                                    name="tokenName"
                                    placeholder="NFT Name (e.g., KlaytnEverywhere)"
                                    value={tokenName}
                                    onChange={(e)=>this.onInputChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="NFT Symbol"
                                    type="text"
                                    name="tokenSymbol"
                                    placeholder="NFT Symbol (e.g., KEW)"
                                    value={tokenSymbol}
                                    onChange={(e)=>this.onInputChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button disabled={deployButtonDisabled} onClick={(e)=> this.deploy(e)}>Deploy</Button>
                            </Col>
                        </Row>
                        {deployMsgVisible &&
                        <Row>
                            <Col md="8">
                                {deployMsg != "" && contractAddress === "" && <CardText style={{color:"#c221a9"}}> {deployMsg} </CardText>}
                                {deployMsg != "" && contractAddress != "" &&
                                <CardText>
                                    {deployMsg}You can check it here : <a href={networkLinks[network]["finderNFT"] + contractAddress}>NFT Address</a>
                                </CardText>}
                            </Col>
                        </Row>
                        }
                    </CardBody>
                </Card>
                {contractAddress && 
                <Card>
                    <CardHeader>
                        <h3 className='title'>Mint the Non-fungible Token (NFT)</h3>
                        <p style={{color:"#6c757d"}}>
                            Enter the NFT's receiver and tokenURI for the image file's location.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="NFT Receiver"
                                    type="text"
                                    name="nftReceiver"
                                    placeholder="Receiver's address"
                                    value={nftReceiver}
                                    onChange={(e)=>this.onInputChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="Token URI"
                                    type="text"
                                    name="tokenURI"
                                    placeholder="Token URI (e.g., https://cryptologos.cc/logos/klaytn-klay-logo.svg?v=023)"
                                    value={tokenURI}
                                    onChange={(e)=>this.onInputChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button disabled={mintButtonDisabled} onClick={(e)=> this.mint(e)}>Mint</Button>
                            </Col>
                        </Row>
                        {mintMsgVisible &&
                        <Row>
                            <Col md="8">
                                {mintMsg != "" && nftReceiver === "" && <CardText style={{color:"#c221a9"}}> {mintMsg} </CardText>}
                                {mintMsg != "" && nftReceiver != "" &&
                                <CardText>
                                    {mintMsg} You can check it here : <a href={networkLinks[network]["finderNFT"] + contractAddress + "?tabId=nftInventory&search=" + nftReceiver}>NFT Inventory</a>
                                </CardText>}
                            </Col>
                        </Row>
                        }
                    </CardBody>
                </Card>
                }
            </Column>
        )
    }
}

export default KIP17Deploy;