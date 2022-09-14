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

class ABIDecoder extends Component {
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

    decodeABI = async() => {
        const { argumentTypes, encodedData } = this.state;
        let typesArray;
        let hexstring;
        try{
            typesArray = argumentTypes.split(' ');
            hexstring = encodedData
            console.log('typesArray', typesArray);
            console.log('hexstring', hexstring);
            const res = await caver.abi.decodeParameters(typesArray, hexstring)
            console.log('res', res);
            if (res){
                let tempArr = []
                for (let i = 0; i < res.__length__; i++){
                    tempArr.push(res[i])
                }
                this.setState({ result: tempArr.toString() })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            console.log(err);
            this.setState({ result: "[ERROR] PLEASE USE THE CORRECT FORMAT OF INPUTS!" })
        }
    }

    render() {
        const { argumentTypes, encodedData, result } = this.state;
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title">ABI Decoder</h3>
                        <p style={{color:"#6c757d"}}>
                            The tool was designed to make easy decoding of Klaytn ABI encoded parameters.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h4 className='title'>Argument Types</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the space-separated value types.
                        </p>
                        <Row>
                            <Col md= "9">
                                <InputField
                                    type="text"
                                    value={argumentTypes}
                                    placeholder="Argument Types (input example : uint128)"
                                    name="argumentTypes"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <h4 className='title'>Encoded Data</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the encoded data to be decoded.
                        </p>
                        <Row>
                            <Col md= "9">
                                <InputField
                                    type="text"
                                    value={encodedData}
                                    placeholder="Encoded Data (input example : 0x00000000000000000000000000000000000000000000000000000000004fdea7)"
                                    name="encodedData"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Button style={{marginTop: "1.75rem"}} onClick={(e) => this.decodeABI(e)}>
                                    DECODE
                                </Button>
                            </Col>
                        </Row>
                        { result != "" ? 
                            <p style={{fontSize: "15px"}}>
                            <h4 className='title'>Result</h4><br></br>
                            {result} </p>
                            : null}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default ABIDecoder;