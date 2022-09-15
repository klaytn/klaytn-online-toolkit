import Caver from 'caver-js'
import InputField from '../components/inputField';
import React, { Component }from "react";
import { Card, CardHeader, CardBody, Row, Col, Button, ButtonGroup, Input, FormGroup } from 'reactstrap';
import classNames from "classnames";
import Column from '../components/Column';
let caver;

class RoleBasedKey extends Component {
    constructor(props){
        super(props);
        this.state = {
            type: ["roleTransactionKey", "roleAccountUpdateKey", "roleFeePayerKey"],
            numOfKeys: ["", "", ""],
            keys: [[""], [""], [""]]
        }
    }

    reset () {
        this.setState({
            numOfKeys: ["", "", ""],
            keys: [[""], [""], [""]]
        })
    }

    handleNumberChange = (e, idx) => {
        const {numOfKeys, keys} = this.state
        numOfKeys[idx] = Math.max(Number(e.target.value), 1);
        keys[idx] = numOfKeys[idx] ? new Array(numOfKeys[idx]).fill("") : new Array(1).fill("")

        this.setState({
            numOfKeys,
            keys
        })
    }

    generateRoleBasedKeys = () =>{
        const roleBasedKeys  = caver.wallet.keyring.generateRoleBasedKeys(this.state.numOfKeys);
        this.setState({
            keys: roleBasedKeys
        })
        this.props.setPrivateKey(roleBasedKeys)
    }

    handleInputChange = (e, roleIdx, keyIdx) => {
        const { keys } = this.state
        keys[roleIdx][keyIdx] = e.target.value
        this.setState({
            keys
        })
        this.props.setPrivateKey(keys)
    }

    render () {
        const { type, numOfKeys, keys }  = this.state
        return (
            <div>
                <Row>
                {numOfKeys.map((val, idx) => {
                    return(
                    <Col md="4">
                        <InputField
                            label={type[idx]}
                            placeholder={`Number of ${type[idx]}s`}
                            type="number"
                            value={val}
                            onChange={(e)=>this.handleNumberChange(e, idx)}
                        />
                        <FormGroup>
                            {keys[idx].map((key, i) => {
                                return (
                                    <Input
                                        type="text"
                                        value={key}
                                        placeholder="Private Key"
                                        onChange={(e)=>this.handleInputChange(e, idx, i)}
                                        style={{marginTop:"5px"}}
                                    />)
                            })}
                        </FormGroup>
                    </Col>)
                })}
                </Row>
                <Row>
                    <Col md="4">
                        <Button onClick={this.generateRoleBasedKeys}>Generate All Keys</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

class MultipleKey extends Component {
    constructor(props){
        super(props);
        this.state = {
            keys: [""],
            numOfKeys: "",
        }
    }

    reset () {
        this.setState({
            keys: [""],
            numOfKeys: "",
        })
    }

    generateMultipleKeys = (e) => {
        const multipleKeys = caver.wallet.keyring.generateMultipleKeys(this.state.numOfKeys);
        this.setState({
            keys: multipleKeys
        })
        this.props.setPrivateKey(multipleKeys)
    }

    handleInputChange = (e, idx) => {
        const { keys } = this.state
        keys[idx] = e.target.value
        this.setState({
            keys
        })
        this.props.setPrivateKey(keys)
    }

    handleNumberChange = (e) => {
        const numOfKeys = Math.max(Number(e.target.value), 1);
        this.setState({
            numOfKeys,
            keys: new Array(numOfKeys).fill("")
        })
    }

    render() {
        const {numOfKeys, keys} = this.state
        return (
            <div>
                <Row>
                    <Col md="4">
                        <InputField
                            type="number"
                            value={numOfKeys}
                            placeholder="Number of Private Keys"
                            label="Number of Private Keys"
                            onChange={this.handleNumberChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md="8">
                        <FormGroup>
                        {keys.length > 0  && <label>Private Keys</label>}
                        {keys.map((key, idx)=>{
                            return (
                                <Input
                                    type="text"
                                    value={key}
                                    placeholder="Private Key"
                                    name="singleKey"
                                    onChange={(e)=>this.handleInputChange(e, idx)}
                                    style={{marginTop:"5px"}}
                                />
                                )})}
                        </FormGroup>
                    </Col>
                </Row>
                {keys.length > 0 &&
                (<div>
                    <Row>
                        <Col md="4">
                            <Button onClick={this.generateMultipleKeys}>Generate All Keys</Button>
                        </Col>
                    </Row>
                </div>)}
            </div>
        )
    }
}

class SingleKey extends Component{
    constructor(props){
        super(props);
        this.state = {
            key: "",
        }
    }

    reset() {
        this.setState({
            key: "",
        })
    }

    generateSingleKey = (e) => {
        const singleKey = caver.wallet.keyring.generateSingleKey();
        this.setState({
            key: singleKey,
        })
        const singleKeyring = caver.wallet.keyring.createFromPrivateKey(singleKey)
        this.props.setAddress(singleKeyring.address)
        this.props.setPrivateKey(singleKey)
    }

    hanldInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        this.props.setPrivateKey(e.target.value)
    }

    render() {
        const { key } = this.state
        return (
            <div>
                <Row>
                    <Col md ="8">
                        <InputField
                            type="text"
                            value={key}
                            placeholder="Private Key"
                            label="Private key"
                            name="key"
                            onChange={(e)=>this.hanldInputChange(e)}
                            style= {{height: "100%"}}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md= "4">
                        <Button onClick={(e)=>{this.generateSingleKey(e)}}> Generate Key </Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

class GenerateKeystore extends Component {
    constructor(props){
        super(props);
        this.state = {
            checkboxIdList: ["Single", "Multiple", "Role-Based"],
            isCheckedList: [true, false, false],
            address:"",
            password: "",
            privateKey: null,
        }
        this.child = React.createRef();
    }

    componentDidMount() {
        caver = new Caver();
    }

    checkBoxClicked = (id)=> {
        const { checkboxIdList, isCheckedList } = this.state;
        for(let i = 0; i < checkboxIdList.length; i ++ )
        {
            if (checkboxIdList[i] == id)
            {
                if (isCheckedList[i] == false){
                    isCheckedList[i] = !isCheckedList[i]
                }
            }
            else{
                isCheckedList[i] = false
            }
        }

        this.child.current.reset();

        this.setState({
            isCheckedList,
            address: "",
            password: "",
            privateKey: null,
            keystoreShown: false,
        })
    }

    setAddress = (address) => {
        this.setState({
            address
        })
    }

    setPrivateKey = (keys)=>{
        this.setState({
            privateKey: keys
        })
    }

    hanldInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    getKeystore = ()=>{
        const { isCheckedList } = this.state
        if (isCheckedList[0])
        {
            return (
                <SingleKey
                    ref={this.child}
                    setAddress={this.setAddress}
                    setPrivateKey={this.setPrivateKey}
                />
            )
        }
        else if(isCheckedList[1])
        {
            return (
                <MultipleKey
                    ref={this.child}
                    setPrivateKey={this.setPrivateKey}
                />
            )
        }
        else if(isCheckedList[2])
        {
            return (
                <RoleBasedKey
                    ref={this.child}
                    setPrivateKey={this.setPrivateKey}
                />
            )
        }
    }

    generateKeystoreV3 = (e) => {
        try {
            const { address, privateKey, password } = this.state
            const keyring = caver.wallet.keyring.create(address, privateKey)
            const keystore = JSON.stringify(keyring.encryptV3(password));

            this.setState({
                keystore,
                keystoreShown: true
             })
        }catch(e){
            this.setState({
                keystore: e.toString(),
                keystoreShown:true
            })
        }
    }

    generateKeystoreV4 = (e) => {
        try {
            const {address, privateKey, password } = this.state
            const keyring = caver.wallet.keyring.create(address, privateKey)
            const keystore = JSON.stringify(keyring.encrypt(password));

            this.setState({
                keystore,
                keystoreShown: true
             })
        }catch(e){
            this.setState({
                keystore: e.toString(),
                keystoreShown:true
            })
        }
    }

    copyCodeToClipboard = (e)=>{
        const el = this.textArea
        el.select()
        document.execCommand("copy")
    }

    downloadFile = (e) => {
        const { address, keystore } = this.state;
        const date = new Date();
        const filename = `keystore-${address}-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.json`;
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(keystore));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    render(){
        const {address, password, keystore, keystoreShown,isCheckedList, checkboxIdList} = this.state;

        return (
            <Column>
                <Card>
                    <CardHeader>
                        <ButtonGroup
                        className="btn-group-toggle float-right"
                        data-toggle="buttons"
                        >
                        {checkboxIdList.map((id, idx) => {
                        return (
                            <Button
                                tag="label"
                                className={classNames("btn-simple", {
                                active: isCheckedList[idx]
                                })}
                                color="info"
                                id="0"
                                size="sm"
                                onClick={() => this.checkBoxClicked(id)}
                            >
                                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                                {id}
                                </span>
                                <span className="d-block d-sm-none">
                                <i className="tim-icons icon-map-02" />
                                </span>
                            </Button>)})}
                        </ButtonGroup>
                        <h3 className="title">Generate Keystore</h3>
                        <p style={{color:"#6c757d"}}>
                            Generate Private Key(s), encrypt a keyring, and return a keystore.
                            Since Klaytn provides various account key types such as multi-signature and role-based keys,
                            Klaytn introduces keystore format v4 which is suitable to store multiple private keys.
                            Single Keyring keystore file can be generated in both v3 and v4 format, while other keyring types are encrypted in v4 format.
                            For more details, please visit here: <a href="https://kips.klaytn.foundation/KIPs/kip-3">[KIP 3: Klaytn Keystore Format v4]</a>.                         </p>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col>
                                {this.getKeystore()}
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <InputField
                                    type="text"
                                    value={address}
                                    placeholder="Address"
                                    label="Address"
                                    name="address"
                                    onChange={this.hanldInputChange}
                                />
                                <InputField
                                    type="password"
                                    value={password}
                                    placeholder="Password"
                                    label="Password"
                                    name="password"
                                    onChange={this.hanldInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md= "8">
                                <Button style={{display: isCheckedList[0]? "inline": "none"}}onClick={this.generateKeystoreV3}>
                                    Generate Keystore(v3)
                                </Button>
                                <Button onClick={this.generateKeystoreV4}>
                                    Generate Keystore(v4)
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <textarea
                                    style={{display: keystoreShown? "inline" : "none", height: "120px"}}
                                    value={keystore}
                                    readOnly
                                    ref={(textarea) => this.textArea = textarea}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="8">
                                <Button style={{display: keystoreShown? "inline" : "none"}} onClick={() => this.copyCodeToClipboard()}>
                                    Copy To Clipboard
                                </Button>
                                <Button style={{display: keystoreShown? "inline" : "none"}} onClick={() => this.downloadFile()}>
                                    Download
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Column>
        )
    }

}

export default GenerateKeystore
