import Caver from 'caver-js'
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, ButtonGroup, Col, Button, Label } from 'reactstrap';
import Column from '../components/Column'
import classNames from "classnames";
let caver;

class FunctionSignature extends Component {
    constructor(props){
        super(props);
        this.state = {
            input: "",
            result: "",
            isInputTypeSelected: [true, false], //string, ABI
            inputTypes: ['String', 'ABI'],
            examples:['myMethod(uint256,string)', '{"name":"myMethod","type":"function","inputs":[{"type":"uint256","name":"myNumber"},{"type":"string","name":"mystring"}]}']
        }
    }

    componentDidMount () {
        caver = new Caver();
    }

    handleInputChange = async(e) =>{
        const { isInputTypeSelected } = this.state;
        const input = e.target.value
        let result = "";
        if (input == "" ){
            this.setState({
                input,
                result,
            })
            return;
        }
        if (isInputTypeSelected[1]){
            try {
                result = caver.abi.encodeFunctionSignature(JSON.parse(input))
            } catch (e) {
                result = e
            }
        }
        else{
            result = caver.abi.encodeFunctionSignature(input)
        }
        this.setState({
            input,
            result,
        })
    }

    checkBoxClicked = (idx) => {
        const { isInputTypeSelected } = this.state;
        for (let i = 0; i<isInputTypeSelected.length; i++){
            if (i === idx){
                if (isInputTypeSelected[i] == false){
                    isInputTypeSelected[i] = !isInputTypeSelected[i]
                }
            }
            else{
                isInputTypeSelected[i] = false
            }
        }
        this.setState({
            isInputTypeSelected,
            input: "",
            result: ""
        })
    }

    copyCodeToClipboard = (e)=>{
        const el = this.textArea
        el.select()
        document.execCommand("copy")
    }

    render(){
        const {input, result, isInputTypeSelected, inputTypes, examples} = this.state;
        return (
            <div>
                <Column>
                    <Card>
                        <CardHeader>
                            <h3 className="title">Encode Function Signature</h3>
                            <p style={{color:"#6c757d"}}>
                            Encodes the function signature to its ABI signature, which are the first 4 bytes of the sha3 hash of the function name including parameter types.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col md="8">
                                    <ButtonGroup
                                        className="btn-group-toggle float-left"
                                        data-toggle="buttons" style={{marginBottom:"1rem"}}
                                        >
                                        {inputTypes.map((id, idx) => {
                                        return (
                                            <Button
                                                tag="label"
                                                className={classNames("btn-simple", {
                                                    active: isInputTypeSelected[idx]
                                                })}
                                                color="info"
                                                id="0"
                                                size="sm"
                                                onClick={() => this.checkBoxClicked(idx)}
                                            >
                                                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                                                {id}
                                                </span>
                                                <span className="d-block d-sm-none">
                                                <i className="tim-icons icon-map-02" />
                                                </span>
                                            </Button>)
                                        })}
                                    </ButtonGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Label>Input</Label>
                                    <textarea
                                        className='form-control'
                                        ref={(textarea) => this.inputArea = textarea}
                                        value={input}
                                        onChange={this.handleInputChange}
                                        placeholder={isInputTypeSelected[0]? examples[0] : examples[1]}
                                        style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md = "12">
                                    <Label>Function Signature</Label>
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

export default FunctionSignature;