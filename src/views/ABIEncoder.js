import React, { Component } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Row,
    Col,
} from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import InputField from "../components/inputField";
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
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title">ABI Encoder</h3>
                        <p style={{color:"#6c757d"}}>
                            The tool was designed to make easy encoding of Klaytn solidity ABI data.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h4 className='title'>Argument Types</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the space-separated value types.
                        </p>
                        <Row>
                            <Col md= "8">
                                <textarea
                                    type="text"
                                    value={argumentTypes}
                                    onChange={this.handleInputChange}
                                    placeholder="Argument Types (input example : bool address)"
                                    name="argumentTypes"
                                    style={{height:"160px", backgroundColor: "#adb5bd", color: "black"}}
                                    className="form-control"
                                />
                            </Col>
                        </Row>
                        <h4 className='title'>Argument Values</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the space-separated values to match the number of types indicated above, using square brackets [] to wrap arrays.<br></br>
                        </p>
                        <Row>
                            <Col md= "8">
                                <textarea
                                    type="text"
                                    value={argumentValues}
                                    onChange={this.handleInputChange}
                                    placeholder="Argument Values (input example : true 0x77656c636f6d6520746f20657468657265756d2e)"
                                    name="argumentValues"
                                    style={{height:"160px", backgroundColor: "#adb5bd", color: "black"}}
                                    className="form-control"
                                />

                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Button style={{marginTop: "1.75rem"}} onClick={(e) => this.encodeABI(e)}>
                                    ENCODE
                                </Button>
                            </Col>
                        </Row>
                        { result != "" ?
                            result != "[ERROR] PLEASE USE THE CORRECT FORMAT OF INPUTS!" ?
                            <Row>
                                <Col md= "9">
                                    <h4 className='title'>Result</h4><br></br>
                                    <textarea
                                        className='form-control'
                                        ref={(textarea) => this.textArea = textarea}
                                        style={{height:"160px", backgroundColor: "#adb5bd", color: "black"}}
                                        value={result}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                            : <p> {result} </p>
                        : null}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default ABIEncoder;