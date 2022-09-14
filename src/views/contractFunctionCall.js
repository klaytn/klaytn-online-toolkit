import Caver from 'caver-js'
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, CardText, FormGroup, Col, Button, Label } from 'reactstrap';
import Column from '../components/Column'
import InputField from '../components/inputField';
import { networkLinks } from "../constants/klaytnNetwork";
let caver;

class FunctionCall extends Component {
    constructor(props){
        super(props);
        this.state = {
            senderAddress: "",
            network: "mainnet",
            contractAddress: "",
            data:"",
            parameters: [],
            abi: "",
            encodeFunctionCallErrorMsg: "",
            buttonDisabled: false,
            functionCallErrorMsg: "",
            result: "",
            input: ""
        }
    }

    componentDidMount(){
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[this.state.network]["rpc"]))
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        })
    }

    handleNetworkChange = (e)=>{
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[e.target.value]["rpc"]))
        this.setState({
            network: e.target.value
        })
    }

    functionCall = async() => {
        const {contractAddress, input} = this.state;
        try {
            this.setState({
                buttonDisabled: true
            })
            const result = await caver.rpc.klay.call({
                to: contractAddress,
                input
            })
            this.setState({
                buttonDisabled: false,
                result,
                functionCallErrorMsg: "",
            })
        } catch (e) {
            this.setState({
                buttonDisabled: false,
                result: "",
                functionCallErrorMsg: e.toString()
            })
        }
    }

    encodeFunctionCall = (e) => {
        try {
            const {abi, parameters} = this.state;
            const data = caver.abi.encodeFunctionCall(abi, parameters)
            this.setState({
                data,
                buttonDisabled: false,
                encodeFunctionCallErrorMsg: ""
            })
        } catch (e) {
            this.setState({
                data: "",
                buttonDisabled: true,
                encodeFunctionCallErrorMsg: e.toString()
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

    parseABI (result) {
        try {
            console.log(result)
            const abi = JSON.parse(result)
            console.log(Object.keys(abi).includes("inputs"))
            if (!Object.keys(abi).includes("inputs"))
            {
                throw Error("This file doesn't include \"inputs\" field.")
            }
            const parameters = new Array(abi["inputs"].length)
            parameters.fill("")
            this.setState({
                abi,
                parameters,
                encodeFunctionCallErrorMsg: "",
                data: ""
            })
        } catch (e) {
            this.setState({
                abi: "",
                parameters: [],
                encodeFunctionCallErrorMsg: e.toString(),
                data: ""
            })
        }
    }

    handleABIChange = (e) =>{
        if (e.target.files.length > 0)
        {
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8")
            fileReader.onload = (event) => {
                this.parseABI(event.target.result)
            };
        }
    }

    copyCodeToClipboard = (e)=>{
        const el = this.textArea
        el.select()
        document.execCommand("copy")
    }

    render () {
        const {
            data, contractAddress, parameters, abi, encodeFunctionCallErrorMsg,
            buttonDisabled, result, functionCallErrorMsg, input
        } = this.state;
        const isEncodedDataShown = data != "" || encodeFunctionCallErrorMsg != "";
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className='title'> Function Call using ABI and Parameters</h3>
                        <p style={{color: "#6c757d"}}>
                            First you can encode a function call using JSON interface object and parameters.
                            Encoded function call is used for input data of transaction call object.
                            Then you can execute a new message call using the encoded data and contract address.
                            This execution does not alter the state of the contract and does not consume gas.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h3 className="title">Encode Function Call </h3>
                        <p style={{color: "#6c757d"}}>
                            Upload ABI file. Input fields will be generated according to parsed ABI.
                            Once you complete to enter all parameters, press Encode button to
                            encode function call.
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
                                <textarea
                                    style={{display: isEncodedDataShown? "inline" : "none", height: "120px"}}
                                    value={data != "" ? data : encodeFunctionCallErrorMsg}
                                    readOnly
                                    ref={(textarea) => this.textArea = textarea}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button style={{display: isEncodedDataShown? "inline" : "none"}} onClick={() => this.copyCodeToClipboard()}>
                                    Copy To Clipboard
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <h3 className="title">Execute Function Call </h3>
                        <p style={{color: "#6c757d"}}>
                            Select which network to send message call and enter the contract address.
                            Copy and Paste the ABI encoded function call generated in the previous section.
                        </p>
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
                                <Label>
                                    Input(ABI Encoded Function Call)
                                </Label>
                                <textarea
                                    className="styled-card-text"
                                    name="input"
                                    value={input}
                                    onChange={this.handleInputChange}
                                    style={{height:"120px"}}
                                />
                            </Col>
                        </Row>
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
                                <Button disabled={buttonDisabled} onClick={(e)=> this.functionCall(e)}>Message Call</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                {result != "" ?
                                <CardText style={{backgroundColor:"black"}}>
                                    The return value of the smart contract function: <strong>{result}</strong>
                                </CardText>
                                : functionCallErrorMsg != ""?
                                <CardText style={{backgroundColor:"black"}}>
                                    {functionCallErrorMsg}
                                </CardText>
                                : null}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default FunctionCall