import React, { Component } from "react";
import { Button, Card, CardHeader, CardBody, Row, Col, Label, FormGroup } from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import Caver from 'caver-js'
import { networkLinks } from '../constants/klaytnNetwork'
import Column from "../components/Column"

const caver = new Caver(new Caver.providers.HttpProvider(networkLinks["mainnet"]["rpc"]));

const INPUT_ERROR_MSG = "[ERROR] PLEASE ENTER THE CORRECT VALUE OF RLP-ENCODED STRING!";

class RLPDecoder extends Component {
    constructor(props){
        super(props);
        this.state = {
            result: "",
            rlpEncoded: ""
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    copyToClipboard = ()=>{
        const el = this.rlpEncoded
        el.select()
        document.execCommand("copy")
    }

    rlpDecode = async () => {
        const { rlpEncoded } = this.state;
        try{
            const res = await caver.transaction.decode(rlpEncoded);
            if (res){
                this.setState({ result: JSON.stringify(res, null, 2) })
            }else{
                this.setState({ result: "" })
            }
        }
        catch(err){
            this.setState({ result: INPUT_ERROR_MSG })
        }
    }

    render() {
        const { rlpEncoded, result } = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">RLP Decoder</h3>
                            <p style={{color:"#6c757d"}}>
                            You can get the transaction by decoding the RLP-encoded transaction string.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col>
                                    <Label>RLP-Encoded Transaction</Label>
                                    <p style={{color:"#6c757d"}}>
                                    Enter the RLP-Encoded transaction string.
                                    </p>
                                    <textarea
                                        className="form-control"
                                        value={rlpEncoded}
                                        onChange={this.handleInputChange}
                                        placeholder="RLP-Encoded ( Example : 0x38e40c850ba43b74008261a8947d0104ac150f749d36bb34999bcade9f2c0bd2e6c4c3018080 )"
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        name="rlpEncoded"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "4">
                                    <Button onClick={(e) => this.rlpDecode()}>
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
                                            ref={(textarea) => this.rlpEncoded = textarea}
                                            style={{height:"600px", backgroundColor: "#adb5bd", color: "black"}}
                                            value={result}
                                            readOnly
                                        />
                                        <Button onClick={() => this.copyToClipboard()}>
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

export default RLPDecoder;