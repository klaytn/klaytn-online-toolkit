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

class RLPDecoder extends Component {
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

    decodeRLP = async() => {
        const { encodedRLP } = this.state;
        try{
            const res = await caver.transaction.decode(encodedRLP);
            if (res){
                this.setState({ result: JSON.stringify(res, null, 2) })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: "[ERROR] PLEASE ENTER THE CORRECT VALUE OF RLP-Encoded STRING!" })
        }
    }

    render() {
        const { encodedRLP, result } = this.state;
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title">RLP Decoder</h3>
                        <p style={{color:"#6c757d"}}>
                            The tool was designed to get a transaction instance from the RLP-encoded transaction string.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h4 className='title'>RLP-encoded String</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the RLP-encoded transaction string.
                        </p>
                        <Row>
                            <Col md= "9">
                                <textarea
                                    type="text"
                                    value={encodedRLP}
                                    onChange={this.handleInputChange}
                                    placeholder="RLP-encoded String (input example : 0x09f885018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0f847f845820feaa068e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492a068c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c280c4c3018080)"
                                    name="encodedRLP"
                                    style={{height:"200px", backgroundColor: "#adb5bd", color: "black"}}
                                    font-size="0.875rem"
                                    font-weight="400"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Button style={{marginTop: "1.75rem"}} onClick={(e) => this.decodeRLP(e)}>
                                    DECODE
                                </Button>
                            </Col>
                        </Row>
                        { result != "" ?
                            result != "[ERROR] PLEASE ENTER THE CORRECT VALUE OF RLP-Encoded STRING!" ?
                            <Row>
                                <Col md= "9">
                                    <h4 className='title'>Result</h4><br></br>
                                    <textarea
                                        ref={(textarea) => this.textArea = textarea}
                                        style={{height:"600px", backgroundColor: "#adb5bd", color: "black"}}
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

export default RLPDecoder;