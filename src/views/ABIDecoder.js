import React, { Component } from "react";
import { Button, Card, CardHeader, CardBody, Row, Col, Label } from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from "../components/Column"
let caver;

class ABIDecoder extends Component {
    constructor(props){
        super(props);
        this.state = {
            network: "mainnet",
            result: "",
            argumentTypes: "",
            encodedData: ""
        }
    }

    componentDidMount(){
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[this.state.network]["rpc"]))
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    decodeABI = async() => {
        const { argumentTypes, encodedData } = this.state;
        let typesArray;
        let hexstring;
        try{
            typesArray = argumentTypes.split(' ');
            hexstring = encodedData
            const res = await caver.abi.decodeParameters(typesArray, hexstring)
            if (res){
                let tempArr = []
                for (let i = 0; i < res.__length__; i++){
                    tempArr.push(res[i])
                }
                this.setState({ result: tempArr.join(", ") })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: "[ERROR] PLEASE USE THE CORRECT FORMAT OF INPUTS!" })
        }
    }

    render() {
        const { argumentTypes, encodedData, result } = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">ABI Decoder</h3>
                            <p style={{color:"#6c757d"}}>
                            The tool is designed to decode ABI encoded parameters.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md = "12">
                                    <Label>Argument Types</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the space-separated value types.
                                    </p>
                                    <textarea
                                        className="form-control"
                                        ref={(textarea) => this.inputArea = textarea}
                                        value={argumentTypes}
                                        onChange={this.handleInputChange}
                                        placeholder="Argument Types (input example : uint128)"
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="argumentTypes"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "12">
                                    <Label>Encoded Data</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the encoded data to be decoded.
                                    </p>
                                    <textarea
                                        className="form-control"
                                        ref={(textarea) => this.inputArea = textarea}
                                        value={encodedData}
                                        onChange={this.handleInputChange}
                                        placeholder="Encoded Data (input example : 0x00000000000000000000000000000000000000000000000000000000004fdea7)"
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="encodedData"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4">
                                    <Button onClick={(e) => this.decodeABI(e)}>
                                        DECODE
                                    </Button>
                                </Col>
                            </Row>
                            { result != "" ?
                                result != "[ERROR] PLEASE USE THE CORRECT FORMAT OF INPUTS!" ?
                                <Row>
                                    <Col md= "12">
                                        <Label>Result</Label>
                                        <textarea
                                            className='form-control'
                                            ref={(textarea) => this.textArea = textarea}
                                            style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                            value={result}
                                            readOnly
                                        />
                                    </Col>
                                </Row>
                                : <p style={{color:"#c221a9"}}> {result} </p>
                            : null}
                        </CardBody>
                    </Card>
                </Column>
            </div>
        )
    }
}

export default ABIDecoder;