import React, { Component } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Row,
    Col,
} from "reactstrap";
import '../../assets/css/black-dashboard-react.css';
import InputField from "../components/inputField";
import Caver from 'caver-js'
import { networkLinks, KIPLinks } from '../constants/klaytnNetwork'
import Column from "../components/Column"
let caver;

class DetectKCT extends Component {
    constructor(props){
        super(props);
        this.state = {
            network: "mainnet",
            contractAddress: "",
            result: "",
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

    handleInputChange = (e) => {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    detectKCT = async () => {
        const { contractAddress } = this.state;
        let result = null;
        //Check if it is KIP7
        try {
            const kip7 = await caver.kct.kip7.detectInterface(contractAddress)
            console.log(kip7)
            if (kip7.IKIP7) {
                result = "KIP-7"
            }
        } catch(err) {
            console.log(err)
            result = err.toString()
        }

        //Check if it is KIP17
        try {
            const kip17 = await caver.kct.kip17.detectInterface(contractAddress)
            console.log(kip17)
            if (kip17.IKIP17) {
                result = "KIP-17"
            }
        }catch(err) {
            console.log(err)
            result = err.toString()
        }

        //Check if it is KIP37
        try{
            const kip37 = await caver.kct.kip37.detectInterface(contractAddress)
            console.log(kip37)
            if (kip37.IKIP37) {
                result = "KIP-37"
            }
        }catch(err) {
            console.log(err)
            result = err.toString()
        }

        if (result == null) {
            result = "This smart contract does not implement KIP Token Standard."
        }

        this.setState({
            result
        })

    }

    render() {
        const { network, contractAddress, result } = this.state;
        return (
            <Column>
                <Card>
                    <CardHeader>
                        <h3 className="title">Klaytn Compatible Token(KCT) Detection</h3>
                        <p style={{color:"#6c757d"}}>
                            <a href="https://kips.klaytn.foundation/KIPs/kip-7"> Klaytn Compatible Token</a> is a special type of a smart contract that implements certain technical specifications.
                            You can check which KCT the smart contract implements using its address.
                        </p>
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
                            <Col md= "6">
                                <InputField
                                    type="text"
                                    value={contractAddress}
                                    placeholder="Address"
                                    label="Contract Address"
                                    name="contractAddress"
                                    onChange={this.handleInputChange}
                                />
                            </Col>
                            <Col md="4">
                                <Button style={{marginTop: "1.75rem"}}onClick={(e)=>this.detectKCT(e)}>
                                    Check
                                </Button>
                            </Col>
                        </Row>
                            {KIPLinks.hasOwnProperty(result) ?
                            <p style={{fontSize: "15px"}}>
                                This smart contract implements <a href={KIPLinks[result]}>{result} Token Standard</a>.
                            </p>
                            : result != "" ? <p style={{fontSize: "15px"}}> {result} </p> : null}
                    </CardBody>
                </Card>
            </Column>
        )
    }

}

export default DetectKCT;