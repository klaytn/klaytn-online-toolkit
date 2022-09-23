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
import BigNumber from "bignumber.js";

let caver;

class KIP7Deploy extends Component {
    constructor(props){
        super(props);
        this.state = {
            network: "mainnet",
            senderKeystoreJSON: "",
            senderKeystorePassword: "",
            senderDecryptMessage: "",
            senderDecryptMessageVisible: false,
            deployMsg: null,
            deployMsgVisible: false,
            deployButtonDisabled: false,
            tokenName: "",
            tokenSymbol: "",
            decimal: "",
            initialSupply: "",
            contracAddress: "",
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


    onInputNumberChange = (e) => {
        const { name, value } = e.target;
        const result = value === "" ? "": Number(value)
        this.setState({
            [name]: result
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
                }, 3000)
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

    deploy = async(e) => {
        const { senderAddress, tokenName, tokenSymbol, decimal, initialSupply } = this.state;
        try {
            if (senderAddress === "") {
                throw Error("Sender Keystore is not uploaded!")
            }

            this.setState({
                deployButtonDisabled: true
            })

            const kip7 = await caver.kct.kip7.deploy({
                name: tokenName,
                symbol: tokenSymbol,
                decimals: decimal,
                initialSupply: BigNumber(initialSupply)
            }, { from: senderAddress })

            this.setState({
                deployMsgVisible: true,
                deployMsg: `Token is successfully deployed! `,
                deployButtonDisabled: false,
                contracAddress: kip7.options.address
            })
        } catch (e) {
            this.setState({
                deployMsg: e.toString(),
                deployMsgVisible: true,
                deployButtonDisabled: false,
                contracAddress: ""
            })

            setTimeout(()=>{
                this.setState({
                    deployMsgVisible: false,
                    deployMsg: ""
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
            contracAddress,
            network,
            tokenName,
            tokenSymbol,
            decimal,
            initialSupply
        } = this.state
        return (
            <Column>
                 <Card>
                    <CardHeader>
                        <h3 className="title">Deploy KIP-7 Token</h3>
                        <p style={{color:"#6c757d"}}>
                            You can deploy a KIP-7 token contract to the Klaytn blockchain.
                            <a href="https://docs.klaytn.foundation/dapp/sdk/caver-js/api-references/caver.kct/kip7#caver-klay-kip7-deploy"> caver.kct.kip7.deploy</a> function is used to deploy a KIP-7 token contract.
                            After successful deployment, you can find contract account in explorer.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h3 className='title'> Upload Deployer Keystore File</h3>
                        <p style={{color:"#6c757d"}}>
                            Upload keystore file. This account must have enough KLAY to deploy a token contract.
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
                        </Row>}
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <h3 className='title'>Token Information</h3>
                        <p style={{color:"#6c757d"}}>
                            Enter the token information: the name of token, the symbol of the token,
                            the number of decimal places the token uses, and the total amount of token to be supplied initially.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="Token Name"
                                    type="text"
                                    name="tokenName"
                                    placeholder="Token Name(ex: MyToken)"
                                    value={tokenName}
                                    onChange={(e)=>this.onInputChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="Token Symbol"
                                    type="text"
                                    name="tokenSymbol"
                                    placeholder="Token Name(ex: MTK)"
                                    value={tokenSymbol}
                                    onChange={(e)=>this.onInputChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="Decimal"
                                    type="number"
                                    name="decimal"
                                    placeholder="Decimal(ex: 18)"
                                    value={decimal}
                                    onChange={(e)=>this.onInputNumberChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    label="Initial Supply"
                                    type="number"
                                    name="initialSupply"
                                    placeholder="Initial Supply(ex: 100000000000000000000)"
                                    value={initialSupply}
                                    onChange={(e)=>this.onInputNumberChange(e)}
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
                                <CardText style={{color:"#c221a9"}}>
                                    {deployMsg} {contracAddress != "" && <a href={networkLinks[network]["finderAddress"]+contracAddress}>{contracAddress}</a>}
                                </CardText>
                            </Col>
                        </Row>
                        }
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default KIP7Deploy;