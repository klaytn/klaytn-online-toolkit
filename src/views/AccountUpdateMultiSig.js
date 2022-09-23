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
    Label,
    FormGroup,
    Input
} from "reactstrap";
import Column from '../components/Column';
import { networkLinks } from '../constants/klaytnNetwork';
import Caver from 'caver-js'
let caver;

class AccountUpdateWithMultiSigKey extends Component {
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
            weightList: [],
            threshold: "",
            accountUpdateMsg: null,
            accountUpdateMsgVisible: false,
            accountUpdateButtonDisabled: false,
            txHash: "",
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

    handleWeightChange = (e, index)=>{
        const { weightList } = this.state;
        weightList[index] = Number(e.target.value);
        this.setState({
            weightList
        })
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;

        this.setState({
            [name]: Number(value)
        })
    }

    handleKeystoreRemove = (index) => {
        const {privateKeyList, weightList} = this.state

        const privKeyList = [...privateKeyList]
        privKeyList.splice(index, 1);
        const weightListUpdated = [...weightList]
        weightListUpdated.splice(index, 1);

        this.setState({
            privateKeyList: privKeyList,
            weightList: weightListUpdated,
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

                //update wallet
                if(caver.wallet.isExisted(keyring.address)){
                    caver.wallet.updateKeyring(keyring)
                }
                else {
                    caver.wallet.add(keyring)
                }

                this.setState ({
                    senderDecryptMessage: "Decryption succeeds!",
                    senderAddress: keyring.address,
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
            this.setState({
                senderDecryptMessage: e.toString(),
                senderDecryptMessageVisible: true,
                senderAddress: ""
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
        const { senderAddress, privateKeyList, weightList, threshold} = this.state;
        try {
            if (senderAddress === "") {
                throw Error("Sender Keystore is not uploaded!")
            }

            if (privateKeyList.length == 0) {
                throw Error("There's no keystore file uploaded for private keys!")
            }
            this.setState({
                accountUpdateButtonDisabled: true
            })

            let newKeys = []
            for (const element of privateKeyList)
            {
                newKeys.push(...element.key)
            }

            const newKeyring = caver.wallet.keyring.create(senderAddress, newKeys)
            const account = newKeyring.toAccount({threshold: threshold, weights: weightList})

            const updateTx = caver.transaction.accountUpdate.create({
                from: senderAddress,
                account: account,
                gas: 100000,
            })

            await caver.wallet.sign(senderAddress, updateTx)

            const receipt = await caver.rpc.klay.sendRawTransaction(updateTx)

            // const accountKey = await caver.rpc.klay.getAccountKey(sender.address)

            this.setState({
                accountUpdateMsgVisible: true,
                accountUpdateMsg: `Account is successfully updated! `,
                accountUpdateButtonDisabled: false,
                txHash: receipt.transactionHash
            })
        } catch (e) {
            this.setState({
                accountUpdateMsg: e.toString(),
                accountUpdateMsgVisible: true,
                accountUpdateButtonDisabled: false,
                txHash: ""
            })

            setTimeout(()=>{
                this.setState({
                    accountUpdateMsgVisible: false,
                    accountUpdateMsg: ""
                })
            }, 5000)
        }
    }

    onFileAndPasswordUpload = (e)=>{
        //decrypt and add priv key to PrivKey list
        const {privateKeyList, weightList, keystoreFileName, keystoreJSON, keystorePassword} = this.state
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
                const weight = [...weightList, ""]
                this.setState({
                    weightList: weight,
                    privateKeyList: list,
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
        const {
            keystorePassword,
            decryptMessage,
            senderKeystorePassword,
            decryptMessageVisible,
            privateKeyList,
            senderDecryptMessage,
            senderDecryptMessageVisible,
            weightList,
            threshold,
            accountUpdateMsgVisible,
            accountUpdateMsg,
            accountUpdateButtonDisabled,
            txHash,
            network
        } = this.state
        return (
            <Column>
                 <Card>
                    <CardHeader>
                        <h3 className="title">Update AccountKey to MultiSigKey</h3>
                        <p style={{color:"#6c757d"}}>
                            Klaytn provides decoupled keys from addresses, so that you can update your keys in the account.
                            This page can be used to update account keys to <a href="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyweightedmultisig">AccountKeyWeightedMultiSig</a>.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <h3 className='title'> Upload Sender Keystore File</h3>
                        <p style={{color:"#6c757d"}}>
                            Upload keystore file that is going to be updated.
                            This account will be used for sending a AccountUpdate transaction to make the update to the key stored on the network, so it must possess sufficient KLAY.
                        </p>
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label> Network </Label>
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
                        <h3 className="title">Upload Keystore File for Private Keys</h3>
                        <p style={{color:"#6c757d"}}> You need private keys for your Klaytn account.
                            Upload here keystore files to be used for private keys. Once decryption succeeds,
                            you can see filename added in decrypted keystore list below. </p>
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
                        <h3 className="title">Update Account</h3>
                        <p style={{color:"#6c757d"}}>
                            Set threshold and the weight of each private key. Then send AccountUpdate transaction.
                        </p>
                    </CardHeader>
                    <CardBody>
                        {privateKeyList.length > 0 &&
                            <Row>
                                <Col md="2">
                                    <InputField
                                        name="threshold"
                                        type="number"
                                        value={threshold}
                                        onChange={(e) => this.handleInputChange(e)}
                                        label="Threshold"
                                    />
                                </Col>
                            </Row>
                        }
                        {privateKeyList.length > 0  ?
                            <Label>
                            Decrypted Keystore List
                            </Label>
                            : <p style={{marginBottom: "1rem", color:"#c221a9"}}>There's no keystore uploaded.</p>
                        }
                        {privateKeyList.map((_, index) => (
                            privateKeyList[index]["key"].length > 0 &&
                            <Row>
                                <Col md= "6">
                                    <CardText style={{verticalAlign:"center"}}>
                                    {privateKeyList[index]["fileName"]}
                                    </CardText>
                                </Col>
                                <Col md="2">
                                    <Input
                                        placeholder="Weight"
                                        style={{marginBottom:"1rem"}}
                                        type="number"
                                        value={weightList[index]}
                                        onChange={(e)=>this.handleWeightChange(e, index)}
                                    />
                                </Col>
                                <Col md="2">
                                    <Button onClick={() => this.handleKeystoreRemove(index)}>Remove</Button>
                                </Col>
                            </Row>
                        ))}

                        <Row>
                        <Col md="8">
                            <Button disabled={accountUpdateButtonDisabled} onClick={(e)=> this.accountUpdate(e)}>Account Update</Button>
                        </Col>
                        </Row>
                        {accountUpdateMsgVisible &&
                        <Row>
                            <Col md="8">
                                <CardText style={{color:"#c221a9"}}>
                                    {accountUpdateMsg} {txHash != "" && <a href={networkLinks[network]["finder"]+txHash}>{txHash}</a>}
                                </CardText>
                            </Col>
                        </Row>
                        }
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default AccountUpdateWithMultiSigKey;