import Caver from 'caver-js'
import InputField from '../components/inputField';
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, Col, Button, Label } from 'reactstrap';

class KeccakFromString extends Component {
    constructor(props){
        super(props);
        this.state = {
            input: "",
            result: "",
        }
    }
    
    handleInputChange = async(e) =>{
        const input = e.target.value
        const result = Caver.utils.sha3(input) // Same with ethUtil.bufferToHex(ethUtil.keccak256(Buffer.from(input)))
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
                <Row>
                <Col md="2"></Col>
                <Col md="8">
                <Card>
                    <CardHeader>
                        <h3 className="title">Keccak256 from String</h3>
                        Keccak-256 online hash function
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="12">
                                <Label>Input</Label>
                                <textarea
                                    ref={(textarea) => this.inputArea = textarea}
                                    value={input}
                                    onChange={this.handleInputChange}
                                    style={{height:"120px"}}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md = "12">
                                <Label>Hash</Label>
                                <textarea
                                    ref={(textarea) => this.textArea = textarea}
                                    style={{height:"50px"}}
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
                </Col>
                </Row>
            </div>
        )
    }
};

export default KeccakFromString;