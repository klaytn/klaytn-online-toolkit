import GenerateKeystore from 'pages/GenerateKeystore'
import KeccakFromString from 'pages/Keccak256'
import LoadKeystore from 'pages/LoadKeystore'
import SendAndSignTx from 'pages/MultisigTx'
import AccountUpdate from 'pages/AccountUpdate'
import DetectKCT from 'pages/DetectKCT'
import FunctionSignature from 'pages/FunctionSignature'
import FunctionCall from 'pages/FunctionCall'
import ABIEncoder from 'pages/ABIEncoder'
import ABIDecoder from 'pages/ABIDecoder'

const routes = [
  {
    name: 'Block Info',
    path: '/blockinfo',
    items: [
      {
        path: '/rlpDecode',
        name: 'Decoder from RLP',
        component: null,
      },
      {
        path: '/blockhashDecode',
        name: 'Decoder from BlockHash',
        component: null,
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
        component: null,
      },
      {
        path: '/rlpDecode',
        name: 'Decoder from RLP',
        component: null,
      },
      {
        path: '/txHashDecode',
        name: 'Decoder from txHash',
        component: null,
      },
      {
        path: '/sendMultisigTx',
        name: 'Send Multisig Transaction',
        component: SendAndSignTx,
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
      },
      {
        path: '/ABIDecoder',
        name: 'ABI Decoder',
        component: ABIDecoder,
      },
      {
        path: '/functionCall',
        name: 'Function Call with ABI & Params',
        component: FunctionCall,
      },
      {
        path: '/functionSig',
        name: 'Encode Function Signature',
        component: FunctionSignature,
      },
      {
        path: '/KCTDetection',
        name: 'KCT Detection',
        component: DetectKCT,
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
      },
      {
        path: '/generateKeystore',
        name: 'Generate Keystore',
        component: GenerateKeystore,
      },
      {
        path: '/hashFromStr',
        name: 'Hash From String(Keccak256)',
        component: KeccakFromString,
      },
      {
        path: '/accountUpdate',
        name: 'Update Account with MultiSigKey',
        component: AccountUpdate,
      },
    ],
  },
]

export default routes
