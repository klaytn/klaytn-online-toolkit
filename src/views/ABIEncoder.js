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
            console.log('typesArray', typesArray);
            console.log('parameters', parameters);
            const res = await caver.abi.encodeParameters(typesArray, parameters)
            console.log('res', res);
            if (res){
                this.setState({ result: res })
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
                        <h4 className='secondTitle'>Argument Types</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the space-separated value types.
                        </p>
                        <Row>
                            <Col md= "8">
                                <InputField
                                    type="text"
                                    value={argumentTypes}
                                    placeholder="Argument Types (input example : bool address)"
                                    name="argumentTypes"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <h4 className='thirdTitle'>Argument Values</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the space-separated values to match the number of types indicated above, using square brackets [] to wrap arrays.<br></br>
                        </p>
                        <Row>
                            <Col md= "8">
                                <InputField
                                    type="text"
                                    value={argumentValues}
                                    placeholder="Argument Values (input example : true 0x77656c636f6d6520746f20657468657265756d2e)"
                                    name="argumentValues"
                                    onChange={this.handleInputChange}
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
                            <p style={{fontSize: "15px"}}>
                            <h4 className='secondTitle'>Result</h4><br></br>
                            {result} </p>
                            : null}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default ABIEncoder;