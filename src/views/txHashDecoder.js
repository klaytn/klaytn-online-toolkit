import React, { Component } from "react";
import { Button, Card, CardHeader, CardBody, Row, Col, Label } from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from "../components/Column"

let caver = new Caver(new Caver.providers.HttpProvider(networkLinks["mainnet"]["rpc"]));

const INPUT_ERROR_MSG = "[ERROR] PLEASE ENTER THE CORRECT VALUE OF TRANSACTION HASH!";

class TxHashDecoder extends Component {
    constructor(props){
        super(props);
        this.state = {
            network: "mainnet",
            result: "",
            rawResult: "",
            txHash: "",
            tx: "",
            rawTx: ""
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    handleNetworkChange = (e)=>{
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[e.target.value]["rpc"]))
        this.setState({
            network: e.target.value
        })
    }

    decodeTxHash = async() => {
        const { txHash } = this.state;
        try{
            const res = await caver.transaction.getTransactionByHash(txHash);
            if (res){
                this.setState({ result: JSON.stringify(res, null, 2), rawResult: res.getRawTransaction() })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: INPUT_ERROR_MSG })
        }
    }

    copyTxToClipboard = ()=>{
        const el = this.tx
        el.select()
        document.execCommand("copy")
    }

    copyRawTxToClipboard = ()=>{
        const el = this.rawTx
        el.select()
        document.execCommand("copy")
    }

    render() {
        const { txHash, result, rawResult } = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">TxHash Decoder</h3>
                            <p style={{color:"#6c757d"}}>
                            On this page, you can query a transaction by transaction hash from the Klaytn network to get a caver transaction instance.
                            </p>
                            <Row>
                                <Col md="4">
                                    <select onChange={(e)=>this.handleNetworkChange(e)} className="form-control">
                                        <option value="mainnet"> Mainnet</option>
                                        <option value="testnet"> Testnet</option>
                                    </select>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col>
                                    <Label>Transaction Hash</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the Transaction Hash.
                                    </p>
                                    <textarea
                                        className="form-control"
                                        value={txHash}
                                        onChange={this.handleInputChange}
                                        placeholder="TxHash ( Example : 0x272272d25387cd8b0d3bf842d0d9fa2dee7c014ae66c3fd7a53865453d9bc7cc )"
                                        style={{height:"80px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="txHash"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "4">
                                    <Button onClick={(e) => this.decodeTxHash()}>
                                        DECODE
                                    </Button>
                                </Col>
                            </Row>
                            { result &&
                                result != INPUT_ERROR_MSG ?
                                <Col>
                                    <Row>
                                        <Label>Transaction</Label>
                                        <textarea
                                            className="form-control"
                                            ref={(textarea) => this.tx = textarea}
                                            style={{height:"600px", backgroundColor: "#adb5bd", color: "black"}}
                                            value={result}
                                            readOnly
                                        />
                                        <Button onClick={() => this.copyTxToClipboard()}>
                                            Copy To Clipboard
                                        </Button>
                                    </Row>
                                    <Row>
                                        <Label>Raw Transaction(RLP-encoded Transaction)</Label>
                                        <textarea
                                            className="form-control"
                                            ref={(textarea) => this.rawTx = textarea}
                                            style={{height:"300px", backgroundColor: "#adb5bd", color: "black"}}
                                            value={rawResult}
                                            readOnly
                                        />
                                        <Button onClick={() => this.copyRawTxToClipboard()}>
                                            Copy To Clipboard
                                        </Button>
                                    </Row>
                                </Col>
                                : <p style={{color:"#c221a9"}}> {result} </p>
                            }
                        </CardBody>
                    </Card>
                </Column>
            </div>
        )
    }
}

export default TxHashDecoder;