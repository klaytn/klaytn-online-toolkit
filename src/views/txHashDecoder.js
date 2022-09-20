import React, { Component } from "react";
import { Button, Card, CardHeader, CardBody, Row, Col, Label } from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
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
            txHash: ""
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

    copyCodeToClipboard = (e)=>{
        const el = this.textArea
        el.select()
        document.execCommand("copy")
    }

    render() {
        const { txHash, result } = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">TxHash Decoder</h3>
                            <p style={{color:"#6c757d"}}>
                            The tool was designed to get a transaction from the transaction hash(TxHash).
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md = "12">
                                    <Label>TxHash</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the TxHash.
                                    </p>
                                    <textarea
                                        className="form-control"
                                        ref={(textarea) => this.inputArea = textarea}
                                        value={txHash}
                                        onChange={this.handleInputChange}
                                        placeholder="TxHash (input example : 0x272272d25387cd8b0d3bf842d0d9fa2dee7c014ae66c3fd7a53865453d9bc7cc)"
                                        style={{height:"80px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="txHash"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "4">
                                    <Button onClick={(e) => this.decodeTxHash(e)}>
                                        DECODE
                                    </Button>
                                </Col>
                            </Row>
                            { result != "" ?
                                result != "[ERROR] PLEASE ENTER THE CORRECT VALUE OF TRANSACTION HASH!" ?
                                <Row>
                                    <Col md = "12">
                                        <Label>Result</Label>
                                        <textarea
                                            className="form-control"
                                            ref={(textarea) => this.textArea = textarea}
                                            style={{height:"700px", backgroundColor: "#adb5bd", color: "black"}}
                                            value={result}
                                            readOnly
                                        />
                                        <Button onClick={() => this.copyCodeToClipboard()}>
                                            Copy To Clipboard
                                        </Button>
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

export default txHashDecoder;