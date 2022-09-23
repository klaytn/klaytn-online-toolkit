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

const roleToIndex = {"RoleTransaction": 0, "RoleAccountUpdate": 1, "RoleFeePayer": 2}
const indexToRole = ["RoleTransaction", "RoleAccountUpdate", "RoleFeePayer"]

class AccountUpdateWithRoleBasedKey extends Component {
    constructor(props){
        super(props);
        this.state = {
            keystoreRole: "RoleTransaction",
            keystoreFileName: "",
            keystoreJSON: "",
            keystorePassword: "",
            decryptMessage: "",
            privateKeyList: [[], [], []],
            decryptMessageVisible: [false, false, false],
            network: "mainnet",
            senderKeystoreJSON: "",
            senderKeystorePassword: "",
            senderDecryptMessage: "",
            senderDecryptMessageVisible: false,
            senderAddress: "",
            weightList: [[], [], []],
            threshold: ["", "", ""],
            accountUpdateMsg: null,
            accountUpdateMsgVisible: false,
            accountUpdateButtonDisabled: false,
            txHash: ""
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

    handleWeightChange = (e, roleIdx, index)=>{
        const { weightList } = this.state;
        weightList[roleIdx][index] = Number(e.target.value);
        this.setState({
            weightList
        })
    }

    handleThresholdChange = (e, roleIdx) => {
        const { threshold } = this.state;
        threshold[roleIdx] = Number(e.target.value);
        this.setState({
            threshold
        })
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    handleKeystoreRemove = (roleIdx, keyIdx) => {
        const {privateKeyList, weightList} = this.state

        const privKeyList = [...privateKeyList]
        privKeyList[roleIdx].splice(keyIdx, 1);
        const weightListUpdated = [...weightList]
        weightListUpdated[roleIdx].splice(keyIdx, 1);

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
            fileReader.onload = (event) => {
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

    handleKeyRoleChange = (e) => {
        this.setState({
            keystoreRole: e.target.value
        })
    }

    decryptSenderKeystore = (e) => {
        const { senderKeystoreJSON, senderKeystorePassword } = this.state;
        try {
            if (senderKeystoreJSON != null) {
                const keyring = caver.wallet.keyring.decrypt(senderKeystoreJSON, senderKeystorePassword)

                if(caver.wallet.isExisted(keyring.address)){
                    caver.wallet.updateKeyring(keyring)
                }
                else {
                    caver.wallet.add(keyring)
                }

                this.setState ({
                    senderAddress: keyring.address,
                    senderDecryptMessage: "Decryption succeeds!",
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
                senderAddress: "",
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

            // Create new Account with RoleBasedKey
            let newKeys = [[], [], []]
            let newKeyWeight = []
            for (let i = 0 ; i < privateKeyList.length; i++)
            {
                if (privateKeyList[i].length > 1) {
                    newKeyWeight.push({threshold: threshold[i], weights:weightList[i]})
                }
                else {
                    newKeyWeight.push({})
                }
                for(const element of privateKeyList[i])
                {
                    newKeys[i].push(...element.key)
                }
            }

            const newKeyring = caver.wallet.keyring.create(senderAddress, newKeys)
            const account = newKeyring.toAccount(newKeyWeight)

            const updateTx = caver.transaction.accountUpdate.create({
                from: senderAddress,
                account: account,
                gas: 500000,
            })

            await caver.wallet.sign(senderAddress, updateTx)

            const receipt = await caver.rpc.klay.sendRawTransaction(updateTx)

            // const accountKey = await caver.rpc.klay.getAccountKey(sender.address)
            // console.log(JSON.stringify(accountKey))

            this.setState({
                accountUpdateMsgVisible: true,
                accountUpdateMsg: `Account is successfully updated!`,
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
        const {privateKeyList, weightList, keystoreFileName, keystoreJSON, keystorePassword, keystoreRole} = this.state
        try {
            if (keystoreJSON != null)
            {
                const roleIdx = roleToIndex[keystoreRole]
                const keyring = caver.wallet.keyring.decrypt(keystoreJSON, keystorePassword)
                const keyList = []
                if (keyring.type == "SingleKeyring")
                {
                    keyList.push(keyring.key.privateKey)
                }
                else {
                    throw Error('Not Single Keyring Keystore!')
                }

                privateKeyList[roleIdx].push({"key": keyList, "fileName": keystoreFileName})
                weightList[roleIdx].push("")
                this.setState({
                    weightList,
                    privateKeyList,
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
                        <h3 className="title">Update AccountKey to Role-Based Key</h3>
                        <p style={{color:"#6c757d"}}>
                            Klaytn provides decoupled keys from addresses, so that you can update your keys in the account.
                            This page can be used to update account keys to <a href="https://docs.klaytn.foundation/klaytn/design/accounts#accountkeyrolebased">AccountKeyRoleBased</a>.
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
                        <p style={{color:"#6c757d"}}>
                            Private keys are required to update your Klaytn account.
                            Select role of key among RoleTransaction, RoleAccountUpdate, and RoleFeePayer.
                            Upload here keystore files to be used for private keys. Once decryption succeeds,
                            you can see the filename added in decrypted keystore list below.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <Label> Role </Label>
                                    <select onChange={(e)=>this.handleKeyRoleChange(e)} className="form-control">
                                        {indexToRole.map((value, _) => (
                                            <option value={value}>{value}</option>
                                        ))}
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
                                    onChange={(e) => this.handleKeystoreChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="password"
                                    name="keystorePassword"
                                    placeholder="Password"
                                    label="Password"
                                    onChange={(e)=> this.handleInputChange(e)}
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
                {privateKeyList.map((keyList, roleIdx) => (
                    <div>
                    <h4>
                        {indexToRole[roleIdx]}: Decrypted Keystore List
                    </h4>
                    {keyList.length > 1 &&
                        <Row>
                            <Col md="2">
                                <InputField
                                    name="threshold"
                                    type="number"
                                    placeholder="Threshold"
                                    alue={threshold[roleIdx]}
                                    onChange={(e) => this.handleThresholdChange(e, roleIdx)}
                                    label="Threshold"
                                />
                            </Col>
                        </Row>
                    }

                    {keyList.length === 0 &&
                        <p style={{marginBottom: "1rem", color:"#c221a9"}}>There's no keystore uploaded.</p>
                    }
                    {keyList.length === 1?
                    keyList.map((_, index) => (
                        keyList[index]["key"].length > 0 &&
                        <Row>
                            <Col md= "6">
                                <CardText style={{verticalAlign:"center"}}>
                                {keyList[index]["fileName"]}
                                </CardText>
                            </Col>
                            <Col md="2">
                                <Button onClick={() => this.handleKeystoreRemove(roleIdx, index)}>Remove</Button>
                            </Col>
                        </Row>
                    ))
                    : keyList.map((_, index) => (
                        keyList[index]["key"].length > 0 &&
                        <Row>
                            <Col md= "6">
                                <CardText style={{verticalAlign:"center"}}>
                                {keyList[index]["fileName"]}
                                </CardText>
                            </Col>
                            <Col md="2">
                                <Input
                                    placeholder="Weight"
                                    style={{marginBottom:"1rem"}}
                                    type="number"
                                    value={weightList[roleIdx][index]}
                                    onChange={(e)=>this.handleWeightChange(e, roleIdx, index)}
                                />
                            </Col>
                            <Col md="2">
                                <Button onClick={() => this.handleKeystoreRemove(roleIdx, index)}>Remove</Button>
                            </Col>
                        </Row>
                    ))}
                    </div>
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
                    </Row>}
                    </CardBody>
                </Card>
            </Column>
        )
    }
}

export default AccountUpdateWithRoleBasedKey;