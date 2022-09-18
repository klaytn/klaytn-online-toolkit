import Caver from 'caver-js'
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, CardText, FormGroup, Col, Button, Label } from 'reactstrap';
import Column from '../components/Column'
import InputField from '../components/inputField';
import { networkLinks } from "../constants/klaytnNetwork";
let caver;

const balanceOfABI =
    JSON.stringify({
        constant: true,
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    })

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
            abiParsed: null,
            encodeFunctionCallErrorMsg: "",
            buttonDisabled: false,
            functionCallErrorMsg: "",
            result: "",
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
        const {contractAddress, data} = this.state;
        try {
            this.setState({
                buttonDisabled: true
            })
            const result = await caver.rpc.klay.call({
                to: contractAddress,
                input: data
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
            const {abiParsed, parameters} = this.state;
            const data = caver.abi.encodeFunctionCall(abiParsed, parameters)
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

    parseABI () {
        try {
            const { abi } = this.state
            const abiParsed = JSON.parse(abi)
            if (!Object.keys(abiParsed).includes("inputs"))
            {
                throw Error("This JSON object doesn't include \"inputs\" field.")
            }
            const parameters = new Array(abiParsed["inputs"].length)
            parameters.fill("")
            this.setState({
                abiParsed,
                parameters,
                encodeFunctionCallErrorMsg: "",
                data: ""
            })
        } catch (e) {
            this.setState({
                parameters: [],
                encodeFunctionCallErrorMsg: e.toString(),
                data: ""
            })
        }
    }

    render () {
        const {
            data, contractAddress, parameters, abi, encodeFunctionCallErrorMsg,
            buttonDisabled, result, functionCallErrorMsg, abiParsed
        } = this.state;
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className='title'> Function Call using ABI and Parameters</h3>
                        <p style={{color: "#6c757d"}}>
                            1. Enter the JSON interface object of a function and click the ParseABI button.
                            Input fields are generated according to the parsed ABI.
                        </p>
                        <p style={{color: "#6c757d"}}>
                            2. When all parameters are entered, click the Encode button to encode the function call.
                            The encoded function call is used as input data of the transaction call object.
                        </p>
                        <p style={{color: "#6c757d"}}>
                            3. Select which network to send a message call to and enter the contract address.
                            Then click the Execute button to execute a new message call.
                            This execution does not alter the state of the contract and does not consume gas.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="12">
                                <Label>ABI(JSON interface object of function)</Label>
                                <textarea
                                    ref={(textarea) => this.inputArea = textarea}
                                    value={abi}
                                    className="form-control"
                                    name="abi"
                                    onChange={(e) => this.handleInputChange(e)}
                                    placeholder={balanceOfABI}
                                    style={{height: "120px", backgroundColor: "#adb5bd", color: "black"}}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button onClick={() => this.parseABI()}>Parse ABI</Button>
                            </Col>
                        </Row>
                        {parameters.map((val, index) => (
                            <Row>
                                <Col md="8">
                                    <InputField
                                        name={abiParsed["inputs"][index]["name"]}
                                        value={val}
                                        placeholder={`${abiParsed["inputs"][index]["name"]}(${abiParsed["inputs"][index]["type"]})`}
                                        type="text"
                                        onChange={(e)=>this.handleParameterChange(e, index)}
                                        id={abiParsed["inputs"][index]["name"]}
                                        label={abiParsed["inputs"][index]["name"]}
                                    />
                                </Col>
                            </Row>
                        ))}
                        {parameters.length > 0 &&
                        <Row>
                            <Col md="8">
                                <Button onClick={(e)=> this.encodeFunctionCall(e)}>Encode</Button>
                            </Col>
                        </Row>}
                        {data != "" ?
                        <Row>
                            <Col md="12">
                                <Label>Input(ABI Encoded Function Call)</Label>
                                <textarea
                                    className='form-control'
                                    style={{backgroundColor: "#adb5bd", color: "black"}}
                                    value={data != "" ? data : encodeFunctionCallErrorMsg}
                                    readOnly
                                />
                            </Col>
                        </Row>
                        : <p style={{color:"#e14eca"}}>{encodeFunctionCallErrorMsg}</p>}
                        {data != "" &&
                        <div>
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
                        </div>}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default FunctionCall