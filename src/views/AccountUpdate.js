import InputField from '../components/inputField';
import React, { Component } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardText,
    Row,
    Col,
} from "reactstrap";
import Column from '../components/Column';
import { networkLinks } from '../constants/klaytnNetwork';
import Caver from 'caver-js'
let caver;

class AccountUpdate extends Component {
    constructor(props){
        super(props);
        this.state = {
            keystoreJSON: "",
            keystorePassword: "",
            decryptMessage: "",
            privateKeyList: [],
            decryptMessageVisible: false,
            network: "mainnet",
            senderKeystoreJSON: "",
            senderKeystorePassword: "",
            senderDecryptMessage: "",
            senderDecryptMessageVisible: false,
            senderPrivateKey: "",
        }
    }

    componentDidMount(){
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[this.state.network]["rpc"]))
    }

    handleNetworkChange = (e)=>{
        caver = new Caver(new Caver.providers.HttpProvider(networkLinks[e.target.value]["rpc"]))
        this.setState({
            network: e.target.value
        })
    }

    handleKeystoreRemove = (index) => {
        const {privateKeyList} = this.state

        const privKeyList = [...privateKeyList]
        privKeyList.splice(index, 1);

        this.setState({
            privateKeyList: privKeyList,
        })
    }

    handleKeystoreChange = (e) => {
        if (e.target.files.length > 0)
        {
            const filename = e.target.files[0].name
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8")
            fileReader.onload = (event) =>{
                const parsedKeystore = JSON.parse(event.target.result)
                this.setState({
                    keystoreFileName: filename,
                    keystoreJSON: parsedKeystore,
                })
            };
        }
    }
    handleSenderKeystoreChange = (e) =>{
        if (e.target.files.length > 0)
        {
            const filename = e.target.files[0].name
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8")
            fileReader.onload = (event) =>{
                const parsedKeystore = JSON.parse(event.target.result)
                this.setState({
                    senderKeystoreJSON: parsedKeystore,
                })
            };
        }
    }

    handleSenderPasswordChange = (e) => {
        const {value} = e.target;
        this.setState({
            senderKeystorePassword: value
        })
    }

    handlePasswordChange = (e)=>{
        const {value} = e.target;
        this.setState({
            keystorePassword: value
        })
    }

    decryptSenderKeystore =(e) => {
        const { senderKeystoreJSON, senderKeystorePassword } = this.state;
        try {
            if (senderKeystoreJSON != null) {
                const keyring = caver.wallet.keyring.decrypt(senderKeystoreJSON, senderKeystorePassword)
                let privateKey;
                if (keyring.type == "SingleKeyring")
                {
                    privateKey = keyring.key.privateKey
                }
                else {
                    throw Error('Not Single Keyring Keystore!')
                }
                this.setState ({
                    senderPrivateKey: privateKey,
                    senderDecryptMessage: "Decryption succeeds",
                    senderDecryptMessageVisible: true,
                })

                setTimeout(()=>{
                    this.setState({
                        senderDecryptMessageVisible: false,
                        senderDecryptMessage: ""
                    })
                }, 3000)
            }
        }catch (e){
            console.log(e)
            this.setState({
                senderDecryptMessage: e.toString(),
                senderDecryptMessageVisible: true,
            })
            setTimeout(()=>{
                this.setState({
                    senderDecryptMessageVisible: false,
                    senderDecryptMessage: ""
                })
            }, 5000)
        }
    }

    accountUpdate = async(e) => {

        const { senderPrivateKey, privateKeyList} = this.state;
        let sender = caver.wallet.keyring.createFromPrivateKey(senderPrivateKey)
        caver.wallet.add(sender)
        console.log('sender address ',  sender.address)

        let newKeys = []
        for (const element of privateKeyList)
        {
            newKeys.push(...element.key)
        }

        const newKeyring = caver.wallet.keyring.create(sender.address, newKeys)
        const account = newKeyring.toAccount({threshold: 2, weights:[1,1,1]})

        const updateTx = caver.transaction.accountUpdate.create({
            from: sender.address,
            account: account,
            gas: 100000,
        })

        await caver.wallet.sign(sender.address, updateTx)

        const receipt = await caver.rpc.klay.sendRawTransaction(updateTx)
        console.log(`Account Update Transaction receipt => `)
        console.log(receipt)
    }

    onFileAndPasswordUpload = (e)=>{
        //decrypt and add priv key to PrivKey list
        const {privateKeyList, keystoreFileName, keystoreJSON, keystorePassword} = this.state
        try {
            if (keystoreJSON != null)
            {
                const keyring = caver.wallet.keyring.decrypt(keystoreJSON, keystorePassword)
                const keyList = []
                if (keyring.type == "SingleKeyring")
                {
                    keyList.push(keyring.key.privateKey)
                }
                else {
                    throw Error('Not Single Keyring Keystore!')
                }
                const list = [...privateKeyList, {"key": keyList, "fileName": keystoreFileName}]
                this.setState({
                    privateKeyList: list,
                    keystoreFileName: "",
                    keystoreJSON: null,
                    keystorePassword: "",
                    decryptMessage: "Decryption succeeds!",
                    decryptMessageVisible: true,
                })

                setTimeout(()=>{
                    this.setState({
                        decryptMessageVisible: false,
                        decryptMessage: ""
                    })
                }, 3000)
            }
        }catch (e){
            console.log(e)
            this.setState({
                decryptMessage: e.toString(),
                decryptMessageVisible: true,
            })
            setTimeout(()=>{
                this.setState({
                    decryptMessageVisible: false,
                    decryptMessage: ""
                })
            }, 5000)
        }
    }

    render () {
        const { keystorePassword, decryptMessage,
            senderKeystorePassword, decryptMessageVisible, privateKeyList,
            senderDecryptMessage, senderDecryptMessageVisible  } = this.state
        console.log('private key list length:  ', privateKeyList.length)
        return (
            <Column>
                 <Card>
                    <CardHeader>
                        <h3 className="title">Transaction Information</h3>
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
                        <Col md="8">
                            <InputField
                                name="keystore"
                                type="file"
                                id="Keystore"
                                label="Keystore"
                                placeholder="Keystore File"
                                accept=".json"
                                onChange={(e) => this.handleSenderKeystoreChange(e)}
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
                                onChange={(e)=> this.handleSenderPasswordChange(e)}
                                value={senderKeystorePassword}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md="8">
                            <Button onClick={(e)=> this.decryptSenderKeystore(e)}>Decrypt</Button>
                            <Button onClick={(e)=> this.accountUpdate(e)}>Account Update</Button>
                        </Col>
                    </Row>
                    {senderDecryptMessageVisible &&
                        <Row>
                            <Col md="8">
                                <CardText style={{color:"#c221a9"}}>
                                    {senderDecryptMessage}
                                </CardText>
                            </Col>
                    </Row>}
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <h3 className="title">Decrypted Keystore List</h3>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md = "8">
                            {privateKeyList.map((_, index) => (
                                privateKeyList[index]["key"].length > 0 &&
                                <Row>
                                    <Col md= "8">
                                        <CardText>
                                        {privateKeyList[index]["fileName"]}
                                        </CardText>
                                    </Col>
                                    <Button onClick={() => this.handleKeystoreRemove(index)}>Remove</Button>
                                </Row>
                            ))}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                 <Card>
                    <CardHeader>
                        <h3 className="title">Upload Keystore File</h3>
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
                            <Button onClick={(e)=> this.onFileAndPasswordUpload(e)}>Decrypt</Button>
                        </Col>
                    </Row>
                        {decryptMessageVisible &&
                        <Row>
                            <Col md="8">
                                <CardText style={{color:"#c221a9"}}>
                                    {decryptMessage}
                                </CardText>
                            </Col>
                        </Row>}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default AccountUpdate;