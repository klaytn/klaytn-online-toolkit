import React, { Component } from "react";
import { Button, Card, CardHeader, CardBody, Row, Col, Label } from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from "../components/Column"

const caver = new Caver(new Caver.providers.HttpProvider(networkLinks["mainnet"]["rpc"]));

const INPUT_ERROR_MSG = "[ERROR] PLEASE ENTER THE CORRECT FORMAT OF INPUTS!"

class ABIEncoder extends Component {
    constructor(props){
        super(props)
        this.state = {
            result: "",
            argumentTypes: "",
            argumentValues: "",
            copy: ""
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    copyToClipboard = () => {
        const el = this.copy
        el.select()
        document.execCommand("copy")
    }

    encodeABI = async() => {
        try{
            const { argumentTypes, argumentValues } = this.state;
            const types = JSON.parse('[' + argumentTypes + ']');
            const values = JSON.parse('[' + argumentValues + ']');
            const res = await caver.abi.encodeParameters(types, values)
            if (res){
                this.setState({ result: res })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: INPUT_ERROR_MSG })
        }
    }

    render() {
        const { argumentTypes, argumentValues, result } = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">ABI Encoder</h3>
                            <p style={{color:"#6c757d"}}>
                            The tool is designed to encode Solidity ABI data.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col>
                                    <Label>Argument Types</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the comma-separated value types.
                                    </p>
                                    <textarea
                                        className="form-control"
                                        value={argumentTypes}
                                        onChange={this.handleInputChange}
                                        placeholder='Argument Types ( Example1 : "bool", "address" || Example2 : "uint8[]", "string" )'
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="argumentTypes"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Label>Argument Values</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the comma-separated values to match the number of types shown above.<br></br>
                                    </p>
                                    <textarea
                                        className="form-control"
                                        value={argumentValues}
                                        onChange={this.handleInputChange}
                                        placeholder='Argument Values (Example1 : true, "0x77656c636f6d6520746f20657468657265756d2e" || Example2 : [34, 255], "Hello!%")'
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="argumentValues"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4">
                                    <Button onClick={(e) => this.encodeABI()}>
                                        ENCODE
                                    </Button>
                                </Col>
                            </Row>
                            { result &&
                                result !== INPUT_ERROR_MSG ?
                                <Row>
                                    <Col>
                                        <Label>Result</Label>
                                        <textarea
                                            className='form-control'
                                            ref={(textarea) => this.copy = textarea}
                                            style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                            value={result}
                                            readOnly
                                        />
                                        <Button onClick={() => this.copyToClipboard()}>
                                            Copy To Clipboard
                                        </Button>
                                    </Col>
                                </Row>
                                : <p style={{color:"#c221a9"}}> {result} </p>
                            }
                        </CardBody>
                    </Card>
                </Column>
            </div>
        )
    }
}

export default ABIEncoder;