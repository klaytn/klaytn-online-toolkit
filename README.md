[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

# NO LONGER MAINTAINED

Since the launch of Kaia Blockchain this repository has been parked in favour of the new open-source projects in [Kaia's Github]. Contributors have now moved there continuing with massive open-source contributions to our blockchain ecosystem. A big thank you to everyone who has contributed to this repository. For more information about Klaytn's chain merge with Finschia blockchain please refer to the launching of Kaia blockchain - [kaia.io](http://kaia.io/).

---

# Klaytn Online Toolkit
Klaytn online toolkit provides code examples and github page to help to utilize the Klaytn SDK(caver-js) easily.
You can test library on: https://toolkit.klaytn.foundation/

## Web3Modal Example
On github page, you can see web3modal demo which is derived from [web3modal/example](https://github.com/WalletConnect/web3modal/tree/master/example) and modified to add Kaikas wallet and Klip wallet. You can add support for multiple providers including Kaikas provider and Klip wallet provider by using [@klaytn/web3modal](https://github.com/klaytn/klaytn-web3modal). We have created a PR in web3modal repo, which is still under review. So we temporarily provide @klaytn/web3modal package.

### Kaikas wallet 
Download [@klaytn/kaikas-web3-provider](https://github.com/klaytn/kaikas-web3-provider) package. The following code is how to configure their provider options:

```javascript
import Web3 from "web3";
import Web3Modal from "web3modal";
import { KaikasWeb3Provider } from "@klaytn/kaikas-web3-provider"

const providerOptions = {
  kaikas: {
    package: KaikasWeb3Provider // required
  }
};

const web3Modal = new Web3Modal({
    providerOptions: providerOptions //required
});

const provider = await web3Modal.connect();

const web3 = new Web3(provider);
```

### Klip wallet 
Download [@klaytn/klip-web3-provider](https://github.com/klaytn/klip-web3-provider) package first. Then you can easily integrate Klip wallet as below:
```javascript
import Web3 from "web3";
import Web3Modal from "web3modal";
import { KlipWeb3Provider } from "@klaytn/klip-web3-provider"

const providerOptions = {
    klip: {
        package: KlipWeb3Provider, //required
        options: {
            bappName: "web3Modal Example App", //required
            rpcUrl: "RPC URL" //required
        }
    }
};

const web3Modal = new Web3Modal({
    providerOptions: providerOptions //required
});

const provider = await web3Modal.connect();

const web3 = new Web3(provider);
```

## Instructions

1. Install dependencies

```bash
$ npm install
```

2. Run

```bash
$ npm start
```
