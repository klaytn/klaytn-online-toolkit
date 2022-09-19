import React, { Component } from "react";
import { Button, Card, CardHeader, CardBody, Row, Col, Label } from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from "../components/Column"
let caver;

class ABIEncoder extends Component {
    constructor(props){
        super(props);
        this.state = {
            network: "mainnet",
            result: "",
            argumentTypes: "",
            argumentValues: ""
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

    encodeABI = async() => {
        const { argumentTypes, argumentValues } = this.state;
        let typesArray;
        let parameters;
        try{
            typesArray = argumentTypes.split(' ');
            let temp = argumentValues.split(' ');
            parameters = temp.map((elem) => {
                if (elem[0] === '['){
                    return elem.slice(1, -1).split(',')
                }
                else{
                    return elem
                }
            })
            for (let i = 0; i < typesArray.length; i++){
                if (typesArray[i] == "bool"){
                    if(parameters[i] == "true"){
                        parameters[i] = true;
                    }
                    else if(parameters[i] == "false"){
                        parameters[i] = false;
                    }
                    else{
                        throw new Error();
                    }
                }
            }
            const res = await caver.abi.encodeParameters(typesArray, parameters)
            if (res){
                this.setState({ result: res })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: "[ERROR] PLEASE USE THE CORRECT FORMAT OF INPUTS!" })
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
                                        placeholder="Argument Types (input example : bool address)"
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="argumentTypes"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "12">
                                    <Label>Argument Values</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the space-separated values to match the number of types indicated above, using square brackets [] to wrap arrays.<br></br>
                                    </p>
                                    <textarea
                                        className="form-control"
                                        ref={(textarea) => this.inputArea = textarea}
                                        value={argumentValues}
                                        onChange={this.handleInputChange}
                                        placeholder="Argument Values (input example : true 0x77656c636f6d6520746f20657468657265756d2e)"
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="argumentValues"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4">
                                    <Button onClick={(e) => this.encodeABI(e)}>
                                        ENCODE
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

export default ABIEncoder;