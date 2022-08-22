import Caver from 'caver-js'
import InputField from '../components/inputField';
import React, { Component }from "react";
import { Card, CardHeader, CardBody, CardFooter, Row, Col, Button, ButtonGroup, CardText, Input, Label, InputGroup, FormGroup, Form} from 'reactstrap';
import classNames from "classnames";


class RoleBasedKey extends Component {
    constructor(props){
        super(props);
        this.state = {
            type: ["roleTransactionKey", "roleAccountUpdateKey", "roleFeePayerKey"],
            numOfKeys: [1, 1, 1],
            keys: [[""], [""], [""]]
        }
    }

    handleNumberChange = (e, idx) => {
        const {numOfKeys, keys} = this.state
        numOfKeys[idx] = e.target.value != "" ? Math.max(Number(e.target.value), 1) : null;
        keys[idx] = numOfKeys[idx] ? new Array(numOfKeys[idx]).fill("") : new Array(1).fill("") 
        
        this.setState({
            numOfKeys,
            keys
        })
    }

    generateRoleBasedKeys = () =>{
        const caver = new Caver();
        const roleBasedKeys  = caver.wallet.keyring.generateRoleBasedKeys(this.state.numOfKeys);
        console.log(roleBasedKeys)
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
                                        style= {{ marginTop : "5px" }}
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
            numOfKeys: 1,
        }
    }

    generateMultipleKeys = (e) => {
        const caver = new Caver();
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
        const numOfKeys = e.target.value != "" ? Math.max(Number(e.target.value), 1): null
        this.setState({
            numOfKeys, 
            keys: new Array(numOfKeys).fill("")
        })
    }

    render() {
        const {numOfKeys, keys} = this.state
        console.log(keys)
        return (
            <div>
                <Row>
                    <Col md="4">
                        <InputField
                            type="number"
                            value={numOfKeys}
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
                                    style= {{marginTop : "5px" }}
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

    generateSingleKey = (e) => {
        const caver = new Caver();
        const singleKey = caver.wallet.keyring.generateSingleKey();
        this.setState({
            key: singleKey, 
        })
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
            isCheckedList: [false, false, false],
            address:"",
            password: "",
            privateKey: null,
        }
    }

    checkBoxClicked = (id)=> {
        const { checkboxIdList, isCheckedList} = this.state;
        for(let i = 0; i < checkboxIdList.length; i ++ )
        {
            if (checkboxIdList[i] == id ) 
            {
                isCheckedList[i] = !isCheckedList[i]
            }
            else{
                isCheckedList[i] = false
            }
        }   
        
        this.setState({
            isCheckedList,
            address: "",
            password: "",
            keystoreShown: false,
        })
    }

    setPrivateKey = (keys)=>{
        console.log(keys);
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
        const {isCheckedList } = this.state 
        if (isCheckedList[0])
        {
            return (
                <SingleKey setPrivateKey={this.setPrivateKey}/>
            )
        }
        else if(isCheckedList[1])
        {
            return (<MultipleKey setPrivateKey={this.setPrivateKey}/>)
        }
        else if(isCheckedList[2])
        {
            return (<RoleBasedKey setPrivateKey={this.setPrivateKey}/>)
        }
    }

    generateKeystore = (e) => {
        try {
            const {address, privateKey, password} = this.state
            const caver = new Caver();
            const keyring = caver.wallet.keyring.create(address, privateKey)
            console.log(keyring)
            let keystore;
            // If single keyring, use keystore v3 standard. Otherwise, v4 standard.
            if (keyring.type === "SingleKeyring"){
                keystore = JSON.stringify(keyring.encryptV3(password));
            }
            else {
                keystore = JSON.stringify(keyring.encrypt(password));
            }

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

    render(){
        const {address, password, keystore, keystoreShown,isCheckedList, checkboxIdList} = this.state;
        
        return (
            <div>
                <Row>
                <Col md="2"></Col>
                <Col md="8">
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
                        Generate Private Key(s) and Keystore Files.
                        
                    
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
                                <Button onClick={this.generateKeystore}>
                                    Generate Keystore 
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <textarea 
                                    style={{width:"100%", marginTop: "5px", display: keystoreShown? "inline" : "none", backgroundColor: "black", color: "white"}}
                                    value={keystore}
                                    readOnly
                                />
                            </Col>
                        </Row>
                    </CardBody>
                    <CardFooter>
                                    
                    </CardFooter>
                </Card>
                </Col>
                </Row>
            </div>
        )
    }

}

export default GenerateKeystore

