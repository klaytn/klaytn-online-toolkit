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

class txHashDecoder extends Component {
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

    decodeTxHash = async() => {
        const { txHash } = this.state;
        try{
            const res = await caver.transaction.getTransactionByHash(txHash);
            if (res){
                this.setState({ result: JSON.stringify(res, null, 2) })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: "[ERROR] PLEASE ENTER THE CORRECT VALUE OF TRANSACTION HASH!" })
        }
    }

    render() {
        const { txHash, result } = this.state;
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title">TxHash Decoder</h3>
                        <p style={{color:"#6c757d"}}>
                            The tool was designed to get a caver transaction instance from the TxHash.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h4 className='title'>TxHash</h4>
                        <p style={{color:"#6c757d"}}>
                            Write the TxHash.
                        </p>
                        <Row>
                            <Col md= "9">
                                <textarea
                                    type="text"
                                    value={txHash}
                                    onChange={this.handleInputChange}
                                    placeholder="TxHash (input example : 0x272272d25387cd8b0d3bf842d0d9fa2dee7c014ae66c3fd7a53865453d9bc7cc)"
                                    name="txHash"
                                    style={{height:"160px", backgroundColor: "#adb5bd", color: "black"}}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <Button style={{marginTop: "1.75rem"}} onClick={(e) => this.decodeTxHash(e)}>
                                    DECODE
                                </Button>
                            </Col>
                        </Row>
                        { result != "" ?
                            result != "[ERROR] PLEASE ENTER THE CORRECT VALUE OF TRANSACTION HASH!" ?
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

export default txHashDecoder;