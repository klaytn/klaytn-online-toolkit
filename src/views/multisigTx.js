import React, { Component } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardText,
    Row,
    Col,
    Label,
    FormGroup
} from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import InputField from "../components/inputField";
import Caver from 'caver-js'
import Column from "../components/Column";
import { networkLinks } from "../constants/klaytnNetwork";

let caver;

class SendAndSignTx extends Component {
    constructor(props){
        super(props);
        this.state = {
            signAndSendMsg: null,
            txHash: null,
            sender:"",
            recipient: "",
            amount: 0,
            buttonDisabled: false,
            rawTransaction: null,
            keystoreJSON: null,
            keystorePassword: "",
            decryptMessage: "",
            privateKeyList: [],
            decryptMessageVisible: false,
            network: "mainnet"
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

    handlePasswordChange = (e)=>{
        const {value} = e.target;
        this.setState({
            keystorePassword: value
        })
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
                else if(keyring.type == "MultipleKeyring")
                {
                    for (const element of keyring.keys)
                    {
                        keyList.push(element.privateKey)
                    }
                }
                else if(keyring.type == "RoleBasedKeyring")
                {
                    const txRoleKeys = keyring.getKeyByRole(caver.wallet.keyring.role.roleTransactionKey)
                    for (const element of txRoleKeys){
                        keyList.push(element.privateKey)
                    }
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

    handleKeystoreRemove = (index) => {
        const {privateKeyList} = this.state

        const privKeyList = [...privateKeyList]
        privKeyList.splice(index, 1);

        this.setState({
            privateKeyList: privKeyList,
        })
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
            sendAndSignMsg: null,
            txHash: null,
            rawTransaction: null,
            buttonDisabled: false,
        })
    }

    onSendTxButtonClick = async(e) =>{
        try{
            this.setState({
                buttonDisabled: true,
                sendAndSignMsg: null,
                txHash: null,
            })
            const vtReceipt = await caver.rpc.klay.sendRawTransaction(this.state.rawTransaction)
            console.log(`Receipt of value transfer transaction after account update => `)
            console.log(vtReceipt)
            this.setState({
                sendAndSignMsg: "Transaction is confirmed!",
                buttonDisabled: false,
                rawTransaction: null,
                txHash: vtReceipt.transactionHash,
            })
        } catch(e){
            //Raw transaction is not changed once error occurs during sending tx.
            this.setState({
                sendAndSignMsg: e.toString(),
                buttonDisabled: false,
                txHash: null,
            })
        }
     }

    onSignTxButtonClick = async(e) =>{
        // Sign transaction with provided keys
        try{
            const {sender, recipient, amount} = this.state
            this.setState({
                buttonDisabled: true,
                sendAndSignMsg: null,
                txHash: null,
                rawTransaction: null,
            })
            let newKeys = []
            for (const element of this.state.privateKeyList)
            {
                newKeys.push(...element.key)
            }
            const newKeyring = caver.wallet.keyring.createWithMultipleKey(sender, newKeys)
            if (caver.wallet.isExisted(sender)){
                caver.wallet.updateKeyring(newKeyring)
            }
            else{
                caver.wallet.add(newKeyring) // caver wallet add keyring if keyring hasn't been updated.
            }
            const vt = caver.transaction.valueTransfer.create({
                from: sender,
                to: recipient,
                value: caver.utils.toPeb(amount, 'KLAY'),
                gas: 50000,
            })

            let signed = await caver.wallet.sign(sender, vt)
            this.setState({
                rawTransaction: signed.getRawTransaction(),
                sendAndSignMsg: "Transaction is signed!",
                txHash: signed.getTransactionHash(),
                buttonDisabled: false
            })
        } catch(e){
            this.setState({
                buttonDisabled: false ,
                sendAndSignMsg: e.toString(),
                txHash: null,
                rawTransaction: null,
            })
        }
    }

    render(){
        const {network, buttonDisabled, txHash, sendAndSignMsg, sender, recipient, amount, privateKeyList, decryptMessageVisible, keystorePassword, decryptMessage} = this.state
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title"> Send MultiSig Transaction </h3>
                        <p style={{color:"#6c757d"}}>
                            This page is for sending a value transfer transaction with a <a href="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyweightedmultisig">multisig account</a>(the account that owns Multiple Signing Keys).
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h3 className="title">Transaction Information</h3>
                        <p style={{color:"#6c757d"}}>Select Mainnet or Testnet. Enter the sender address, recipient address, and KLAY amount.</p>
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <Label>Network</Label>
                                    <select onChange={(e)=>this.handleNetworkChange(e)} className="form-control">
                                        <option value="mainnet"> Mainnet</option>
                                        <option value="testnet"> Testnet</option>
                                    </select>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="text"
                                    value={sender}
                                    placeholder="Sender Address"
                                    label="Sender"
                                    name="sender"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="text"
                                    value={recipient}
                                    placeholder="Recipient Address"
                                    label="Recipient"
                                    name="recipient"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                <InputField
                                    type="number"
                                    value={amount}
                                    placeholder="Amount(KLAY)"
                                    label="Amount"
                                    name="amount"
                                    unit="KLAY"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                    </CardBody>
                    <CardFooter>
                        <Col md="8">
                            <Row>
                                <Button disabled={buttonDisabled} onClick={this.onSignTxButtonClick}>Sign Transaction</Button>
                                <Button disabled={buttonDisabled || this.state.rawTransaction == null} onClick={this.onSendTxButtonClick}>Send Transaction</Button>
                            </Row>
                            <Row>
                                <CardText style={{display: sendAndSignMsg!=null && txHash==null? "inline" : "none", backgroundColor:"black"}}>
                                    {sendAndSignMsg}
                                </CardText>
                                <CardText style={{display: sendAndSignMsg!=null && txHash!=null? "inline" : "none"}}>
                                    {sendAndSignMsg} Transaction Hash: <a href={networkLinks[network]["finder"]+txHash}>{txHash}</a>
                                </CardText>
                            </Row>
                        </Col>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <h3 className="title">Upload Keystore File</h3>
                        <p style={{color:"#6c757d"}}>
                            You need private keys to sign transaction. Upload here keystore files to be used for private keys.
                            Once decryption succeeds, you can see filename added in decrypted keystore list below.
                        </p>
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
                <Card>
                    <CardHeader>
                        <h3 className="title">Decrypted Keystore List</h3>
                        {privateKeyList.length === 0 &&
                        <p style={{marginBottom: "1rem", color:"#c221a9"}}>There's no keystore uploaded.</p>
                        }
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
            </Column>
        )
    }
}

export default SendAndSignTx