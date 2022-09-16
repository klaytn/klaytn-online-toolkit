import InputField from '../components/inputField';
import React, { Component }from "react";
import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import Column from '../components/Column';
import Caver from "caver-js"
let caver;

class LoadKeystore extends Component {
    constructor(props){
        super(props);
        this.state = {
            keystoreJSON: "",
            keystorePassword: "",
            decryptMessage: ""
        }
    }

    componentDidMount(){
        caver = new Caver();
    }

    handleKeystoreChange = (e) => {
        if (e.target.files.length > 0)
        {
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8")
            fileReader.onload = (event) =>{
                const parsedKeystore = JSON.parse(event.target.result)
                this.setState({
                    keystoreJSON: parsedKeystore,
                    decryptMessage: ""
                })
            };
        }
    }

    handlePasswordChange = (e)=>{
        const {value} = e.target;
        this.setState({
            keystorePassword: value
        })
    }

    decrypt = (e)=>{
        //decrypt and add priv key to PrivKey list
        const {keystoreJSON, keystorePassword} = this.state
        try {
            if (keystoreJSON != null)
            {
                const keyring = caver.wallet.keyring.decrypt(keystoreJSON, keystorePassword)
                const message =  keyring.type + " " + JSON.stringify(keyring)
                this.setState({
                    keystorePassword: "",
                    decryptMessage: message,
                })
            }
        }catch (e){
            this.setState({
                decryptMessage: e.toString(),
            })
        }
    }

    render () {
        const { keystorePassword, decryptMessage } = this.state
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title">Load Keystore File</h3>
                        <p style={{color: "#6c757d"}}>Decrypt a keystore v3 or v4 JSON and return the decrypted Keyring instance. </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="8">
                                <InputField
                                    name="keystore"
                                    type="file"
                                    id="Keystore"
                                    label="Keystore"
                                    placeholder="Keystore File"
                                    accept=".json"
                                    onChange={(e) => this.handleKeystoreChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    label="Password"
                                    onChange={(e)=> this.handlePasswordChange(e)}
                                    value={keystorePassword}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button style={{marginBottom: "1rem"}} onClick={(e)=> this.decrypt(e)}>Decrypt</Button>
                            </Col>
                        </Row>
                        {decryptMessage != "" && <Row>
                            <Col md="12">
                                <textarea
                                    className='form-control'
                                    style={{height:"120px", backgroundColor: "#adb5bd", color: "black"}}
                                    value={decryptMessage}
                                    readOnly
                                />
                            </Col>
                        </Row>}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default LoadKeystore;