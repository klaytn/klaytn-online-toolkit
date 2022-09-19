import Caver from 'caver-js'
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, CardText, ButtonGroup, FormGroup, Col, Button, Label, CardFooter } from 'reactstrap';
import Column from '../components/Column'
import InputField from '../components/inputField';
import { networkLinks } from "../constants/klaytnNetwork";
let caver;

class SendSmartContractExecutionTx extends Component {
    constructor(props){
        super(props);
        this.state = {
            senderAddress: "",
            network: "mainnet",
            senderKeystoreJSON: "",
            senderKeystorePassword: "",
            senderDecryptMessage: "",
            senderDecryptMessageVisible: false,
            gas: 30000,
            contractAddress: "",
            data:"",
            parameters: [],
            abi: "",
            encodeFunctionCallErrorMsg: "",
            buttonDisabled: false,
        }
    }

    componentDidMount(){
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[this.state.network]["rpc"]))
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

    walletUpdate() {
        const { senderKeystoreJSON, senderKeystorePassword } = this.state;
        if (senderKeystoreJSON != null) {

            const senderKeyring = caver.wallet.keyring.decrypt(senderKeystoreJSON, senderKeystorePassword)

            if(caver.wallet.isExisted(senderKeyring.address)){
                caver.wallet.updateKeyring(senderKeyring)
            }
            else {
                caver.wallet.add(senderKeyring)
            }
            console.log(senderKeyring)
            console.log(senderKeyring.address)
            this.setState({
                senderAddress: senderKeyring.address
            })
        }
    }

    handleParameterChange = (e, index) => {
        const {parameters} = this.state;
        parameters[index] = e.target.value
        this.setState({
            parameters
        })
    }

    handleABIChange = (e) =>{
        if (e.target.files.length > 0)
        {
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8")
            fileReader.onload = (event) =>{
                const abi = JSON.parse(event.target.result)
                console.log(abi["inputs"])
                const parameters = new Array(abi["inputs"].length)
                parameters.fill("")
                this.setState({
                    abi,
                    parameters
                })
            };

        }
    }

    decryptSenderKeystore = (e) => {
        try {
            this.walletUpdate();
            this.setState ({
                senderDecryptMessage: "Decryption succeeds!",
                senderDecryptMessageVisible: true,
            })

            setTimeout(()=>{
                this.setState({
                    senderDecryptMessageVisible: false,
                    senderDecryptMessage: ""
                })
            }, 3000)
        }catch (e){
            console.log(e)
            this.setState({
                senderDecryptMessage: e.toString(),
                senderDecryptMessageVisible: true,
            })
            setTimeout(()=>{
                this.setState({
                    senderDecryptMessageVisible: false,
                    senderDecryptMessage: ""
                })
            }, 5000)
        }
    }

    encodeFunctionCall = (e) => {
        try {
            const {abi, parameters} = this.state;
            const data = caver.abi.encodeFunctionCall(abi, parameters)
            this.setState({
                data,
                encodeFunctionCallErrorMsg: ""
            })
        } catch (e) {
            this.setState({
                encodeFunctionCallErrorMsg: e.toString(),
                data: ""
            })
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        })
    }

    handleNetworkChange = (e)=>{
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[e.target.value]["rpc"]))
        this.walletUpdate()
        this.setState({
            network: e.target.value
        })
    }

    onSendTxButtonClick = async(e) => {
        try {
            this.setState({
                buttonDisabled: true,
            })
            const {senderAddress, contractAddress, data, gas} = this.state;
            const smartContractExecutionTx = caver.transaction.smartContractExecution.create({
                type: 'SMART_CONTRACT_EXECUTION',
                from: senderAddress,
                to: contractAddress,
                input: data,
                gas
            })
            const signed = await caver.wallet.sign(senderAddress, smartContractExecutionTx)
            const receipt = await caver.rpc.klay.sendRawTransaction(signed.getRawTransaction())
            this.setState({
                buttonDisabled: false,
            })
            console.log(receipt)
        } catch (e) {
            this.setState({
                buttonDisabled: false,
            })
        }
    }

    render () {
        const {
            senderAddress, senderKeystorePassword, senderDecryptMessage, senderDecryptMessageVisible,
            data, gas, contractAddress, parameters, abi, encodeFunctionCallErrorMsg, buttonDisabled
        } = this.state;
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className='title'>Function Call using ABI and Parameters</h3>
                        <p style={{color:"#6c757d"}}>
                            This page is for sending Smart Contract Execution transaction.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h3 className='title'>Encode Function Call </h3>
                        <p style={{color:"#6c757d"}}>
                            Encodes a function call using its JSON interface object and given parameters.
                        </p>
                        <Row>
                            <Col md="8">
                                <InputField
                                    name="abi"
                                    type="file"
                                    id="ABI"
                                    label="ABI"
                                    placeholder="ABI File"
                                    accept=".json"
                                    onChange={(e) => this.handleABIChange(e)}
                                />
                            </Col>
                        </Row>
                        {parameters.map((val, index) => (
                            <Row>
                                <Col md="8">
                                    <InputField
                                        name={abi["inputs"][index]["name"]}
                                        value={val}
                                        placeholder={`${abi["inputs"][index]["name"]}(${abi["inputs"][index]["type"]})`}
                                        type="text"
                                        onChange={(e)=>this.handleParameterChange(e, index)}
                                        id={abi["inputs"][index]["name"]}
                                        label={abi["inputs"][index]["name"]}
                                    />
                                </Col>
                            </Row>
                        ))}
                        <Row>
                            <Col md="8">
                                <Button onClick={(e)=> this.encodeFunctionCall(e)}>Encode</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col md="8">
                                {data != "" ?
                                <CardText style={{backgroundColor:"#1d253b", color: "white", fontSize: "0.75rem"}}>
                                    {data}
                                </CardText>
                                : <CardText style={{backgroundColor:"#1d253b", color: "#c221a9", fontSize: "0.75rem"}}>
                                    {encodeFunctionCallErrorMsg}
                                </CardText>}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <h3 className='title'>Upload Sender Keystore</h3>
                        <p style={{color:"#6c757d"}}>
                        Upload keystore file that is going to be updated. This account will be used for sending a Smart Contract Execution transaction to call the function, so it must possess sufficient KLAY.
                        </p>
                    </CardHeader>
                    <CardBody>
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
                                name="senderKeystorePassword"
                                placeholder="Password"
                                label="Password"
                                onChange={(e)=> this.handleInputChange(e)}
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
                        <h3 className='title'>Send Transaction</h3>
                        <p style={{color:"#6c757d"}}>
                        Select Mainnet or Testnet. Enter contract address(token address), and gas that will be used.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <Label>Network</Label>
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
                                    type="text"
                                    value={senderAddress}
                                    readOnly
                                    placeholder="Sender Address"
                                    label="Sender Address"
                                    name="senderAddress"
                                />
                            </Col>
                        </Row>

                        {data && <Row>
                            <Col md="8">
                                <Label>
                                    Data
                                </Label>
                                <CardText style={{backgroundColor:"#1d253b", color: "#344675", cursor: "not-allowed", fontSize: "0.75rem"}}>
                                    {data}
                                </CardText>
                            </Col>
                        </Row> }
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="text"
                                    value={contractAddress}
                                    placeholder="Contract Address"
                                    label="Contract Address(Token Address)"
                                    name="contractAddress"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="text"
                                    value={gas}
                                    placeholder="gas"
                                    label="Gas"
                                    name="gas"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button disabled={buttonDisabled} onClick={this.onSendTxButtonClick}>Send Transaction</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Column>

        );
    }
}

export default SendSmartContractExecutionTx;