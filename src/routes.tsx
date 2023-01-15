import BlockHashDecoder from './views/BlockInfo/BlockHashDecoder'

import AccountKeyLegacy from './views/Account/AccountKeyLegacy'
import AccountKeyPublic from './views/Account/AccountKeyPublic'
import AccountKeyMultiSig from './views/Account/AccountKeyMultiSig'
import AccountKeyRoleBased from './views/Account/AccountKeyRoleBased'

import SendMultisigTx from './views/Transaction/SendMultisigTx'
import TxHashDecoder from './views/Transaction/TxHashDecoder'
import RLPEncoder from './views/Transaction/RLPEncoder'
import RLPDecoder from './views/Transaction/RLPDecoder'

import FunctionSignature from './views/SmartContract/FunctionSignature'
import FunctionCall from './views/SmartContract/FunctionCall'
import ABIEncoder from './views/SmartContract/ABIEncoder'
import ABIDecoder from './views/SmartContract/ABIDecoder'

import DetectKCT from './views/KCT/DetectKCT'
import KIP7Deploy from './views/KCT/KIP7Deploy'
import KIP17Deploy from './views/KCT/KIP17Deploy'
import KIP37Deploy from './views/KCT/KIP37Deploy'

import CheckAccountKey from './views/Miscellaneous/CheckAccountKey'
import GenerateKeystore from './views/Miscellaneous/GenerateKeystore'
import KeccakFromString from './views/Miscellaneous/KeccakFromString'
import LoadKeystore from './views/Miscellaneous/LoadKeystore'

import Web3modalExample from './views/Web3modal'
import Web3modalNFT from './views/Web3modal/web3modalNFT'

import KaiKasTutorial1 from './views/Kaikas/KaikasTutorial1'
import KaiKasTutorial2 from './views/Kaikas/KaikasTutorial2'
import KaikasTutorial3 from './views/Kaikas/KaikasTutorial3'
import KaikasTutorial4 from './views/Kaikas/KaikasTutorial4'

import { RouteType } from 'types'

const routes: RouteType[] = [
  {
    name: 'Web3Modal',
    path: '/web3modal',
    items: [
      {
        path: '/example',
        name: 'Function Examples',
        component: Web3modalExample,
        description:
          'Tests several functions using Metamask, Kaikas, and Klip: signMessage, valueTransfer, and balanceOf',
      },
      {
        path: '/NFT',
        name: 'Deploy & Mint & Transfer NFT (KIP-17)',
        component: Web3modalNFT,
        description:
          'Deploys, mints, and transfers NFT(KIP-17) on klaytn network using Metamask, Kaikas, and Klip',
      },
    ],
  },
  {
    name: 'Block Info',
    path: '/blockinfo',
    items: [
      {
        path: '/blockhashDecode',
        name: 'Decoder from BlockHash',
        component: BlockHashDecoder,
        description: 'Returns block info by block hash',
      },
    ],
  },
  {
    name: 'Account',
    path: '/account',
    items: [
      {
        path: '/accountKeyLegacy',
        name: 'Basic Account',
        component: AccountKeyLegacy,
        description: 'Generates account with AccountKeyLegacy',
      },
      {
        path: '/accountKeyPublic',
        name: 'Advanced (AccountKeyPublic)',
        component: AccountKeyPublic,
        description: 'Updates the private key of account to AccountKeyPublic',
      },
      {
        path: '/accountKeyMultiSig',
        name: 'Advanced (AccountKeyMultiSig)',
        component: AccountKeyMultiSig,
        description: 'Updates the private key of account to AccountKeyMultiSig',
      },
      {
        path: '/accountKeyRoleBased',
        name: 'Advanced (AccountKeyRoleBased)',
        component: AccountKeyRoleBased,
        description:
          'Updates the private key of account to AccountKeyRoleBased',
      },
    ],
  },
  {
    name: 'Transaction',
    path: '/transaction',
    items: [
      {
        path: '/rlpEncode',
        name: 'RLP Encoder',
        component: RLPEncoder,
        description:
          'Encodes a transaction instance and returns RLP-encoded transaction string',
      },
      {
        path: '/rlpDecode',
        name: 'Decoder from RLP',
        component: RLPDecoder,
        description:
          'Decodes RLP-encoded transaction string and returns a transaction instance',
      },
      {
        path: '/txHashDecode',
        name: 'Decoder from txHash',
        component: TxHashDecoder,
        description: 'Returns transaction instance by transaction hash',
      },
      {
        path: '/sendMultisigTx',
        name: 'Send Multisig Transaction',
        component: SendMultisigTx,
        description: 'Sends a value transfer transaction with a multisig Key',
      },
    ],
  },
  {
    name: 'Smart Contract',
    path: '/smartcontract',
    items: [
      {
        path: '/ABIEncoder',
        name: 'ABI Encoder',
        component: ABIEncoder,
        description: 'Encodes Solidity ABI data',
      },
      {
        path: '/ABIDecoder',
        name: 'ABI Decoder',
        component: ABIDecoder,
        description: 'Decodes ABI encoded parameters',
      },
      {
        path: '/functionCall',
        name: 'Function Call with ABI & Params',
        component: FunctionCall,
        description:
          'Executes a new message call without sending a transaction',
      },
      {
        path: '/functionSig',
        name: 'Encode Function Signature',
        component: FunctionSignature,
        description: 'Encodes the function signature to its ABI signature',
      },
    ],
  },
  {
    path: '/kct',
    name: 'Klaytn Tokens',
    items: [
      {
        path: '/KIP7Deploy',
        name: 'Deploy Fungible Token (KIP-7)',
        component: KIP7Deploy,
        description: 'Deploys fungible token(KIP-7) contract',
      },
      {
        path: '/KIP17Deploy',
        name: 'Deploy Non-Fungible Token (KIP-17)',
        component: KIP17Deploy,
        description:
          'Deploys non-fungible token(KIP-17) contract and tests functions: Mint, Burn, Transfer, and Pause/Unpause',
      },
      {
        path: '/KIP37Deploy',
        name: 'Deploy Multiple Token (KIP-37)',
        component: KIP37Deploy,
        description:
          'Deploys multiple token(KIP-37( contract and tests functions: Create, Mint, and Transfer',
      },
      {
        path: '/KCTDetection',
        name: 'Detect Klaytn Compatible Token (KCT)',
        component: DetectKCT,
        description:
          'Checks which KCT the smart contract implements using its address',
      },
    ],
  },
  {
    name: 'Kaikas',
    path: '/kaikas',
    items: [
      {
        path: '/kaikasTutorial1',
        name: 'Tutorial 1 (Legacy, Account Update)',
        component: KaiKasTutorial1,
        description:
          'Test several functions(legacy transaction, account update, etc,.) of kaikas wallet',
      },
      {
        path: '/kaikasTutorial2',
        name: 'Tutorial 2 (Value Transfer)',
        component: KaiKasTutorial2,
        description:
          'Test several functions(value transfer, value transfer with memo, etc,.) of kaikas wallet',
      },
      {
        path: '/kaikasTutorial3',
        name: 'Tutorial 3 (Contract Deploy, Execution)',
        component: KaikasTutorial3,
        description:
          'Test several functions(smart contract deploy, smart contract execution, etc,.) of kaikas wallet',
      },
      {
        path: '/kaikasTutorial4',
        name: 'Tutorial 4 (Add Token, Sign Message)',
        component: KaikasTutorial4,
        description:
          'Test several functions(add token, sign message, etc,.) of kaikas wallet',
      },
    ],
  },
  {
    name: 'Miscellaneous',
    path: '/misc',
    items: [
      {
        path: '/loadKeystore',
        name: 'Load Keystore',
        component: LoadKeystore,
        description:
          'Decrypts a keystore v3 or v4 JSON and returns the decrypted Keyring instance',
      },
      {
        path: '/generateKeystore',
        name: 'Generate Keystore',
        component: GenerateKeystore,
        description:
          'Generates private key(s), encrypts a keyring, and returns a keystore',
      },
      {
        path: '/hashFromStr',
        name: 'Hash From String(Keccak256)',
        component: KeccakFromString,
        description: 'Returns Keccak-256 function result of given input string',
      },
      {
        path: '/checkAccountKey',
        name: 'Check Account Key Type by Address',
        component: CheckAccountKey,
        description: 'Returns account key type of the given address',
      },
    ],
  },
]

export default routes
