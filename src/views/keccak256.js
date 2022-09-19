import Caver from 'caver-js'
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, Col, Button, Label } from 'reactstrap';
import Column from '../components/Column'
let caver;

class KeccakFromString extends Component {
    constructor(props){
        super(props);
        this.state = {
            input: "",
            result: "",
        }
    }

    componentDidMount() {
        caver = new Caver();
    }

    handleInputChange = async(e) =>{
        const input = e.target.value
        const result = caver.utils.sha3(input) // Same with ethUtil.bufferToHex(ethUtil.keccak256(Buffer.from(input)))
        this.setState({
            input,
            result,
        })
    }

    copyCodeToClipboard = (e)=>{
        const el = this.textArea
        el.select()
        document.execCommand("copy")
    }

    render(){
        const {input, result} = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">Keccak256 from String</h3>
                            <p style={{color: "#6c757d"}}>Keccak-256 online hash function</p>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md="12">
                                    <Label>Input</Label>
                                    <textarea
                                        ref={(textarea) => this.inputArea = textarea}
                                        value={input}
                                        onChange={this.handleInputChange}
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                        className="form-control"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "12">
                                    <Label>Hash</Label>
                                    <textarea
                                        className='form-control'
                                        ref={(textarea) => this.textArea = textarea}
                                        style={{height:"40px", backgroundColor: "#adb5bd", color: "black"}}
                                        value={result}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                            <Row>
                            <Col md="8">
                                <Button onClick={() => this.copyCodeToClipboard()}>
                                    Copy To Clipboard
                                </Button>
                            </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Column>
            </div>
        )
    }
};

export default KeccakFromString;