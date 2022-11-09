import BlockHashDecoder from './views/BlockInfo/BlockHashDecoder'

import CreateKeystore from './views/Account/CreateKeystore'
import AccountKeyLegacy from './views/Account/AccountKeyLegacy'
import AccountKeyPublic from './views/Account/AccountKeyPublic'
import AccountKeyMultiSig from './views/Account/AccountKeyMultiSig'

import SendMultisigTx from './views/Transaction/SendMultisigTx'
import TxHashDecoder from './views/Transaction/TxHashDecoder'
import RLPEncoder from './views/Transaction/RLPEncoder'
import RLPDecoder from './views/Transaction/RLPDecoder'

import FunctionSignature from './views/SmartContract/FunctionSignature'
import FunctionCall from './views/SmartContract/FunctionCall'
import ABIEncoder from './views/SmartContract/ABIEncoder'
import ABIDecoder from './views/SmartContract/ABIDecoder'
import DetectKCT from './views/SmartContract/DetectKCT'
import KIP7Deploy from './views/SmartContract/KIP7Deploy'
import KIP17Deploy from './views/SmartContract/KIP17Deploy'
import KIP37Deploy from './views/SmartContract/KIP37Deploy'

import CheckAccountKey from './views/Miscellaneous/CheckAccountKey'
import GenerateKeystore from './views/Miscellaneous/GenerateKeystore'
import KeccakFromString from './views/Miscellaneous/KeccakFromString'
import LoadKeystore from './views/Miscellaneous/LoadKeystore'
import AccountUpdateWithRoleBasedKey from './views/Miscellaneous/AccountUpdateRoleBased'

import Web3modalExample from './views/Web3modal'
import Web3modalNFT from './views/Web3modal/web3modalNFT'

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
      },
      {
        path: '/NFT',
        name: 'Deploy & Mint & Transfer NFT (KIP-17)',
        component: Web3modalNFT,
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
      },
    ],
  },
  {
    name: 'Account',
    path: '/account',
    items: [
      {
        path: '/keystore',
        name: 'Keystore',
        component: CreateKeystore,
      },
      {
        path: '/accountKeyLegacy',
        name: 'Basic Account',
        component: AccountKeyLegacy,
      },
      {
        path: '/accountKeyPublic',
        name: 'Advanced (AccountKeyPublic)',
        component: AccountKeyPublic,
      },
      {
        path: '/accountKeyMultiSig',
        name: 'Advanced (AccountKeyMultiSig)',
        component: AccountKeyMultiSig,
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
      },
      {
        path: '/rlpDecode',
        name: 'Decoder from RLP',
        component: RLPDecoder,
      },
      {
        path: '/txHashDecode',
        name: 'Decoder from txHash',
        component: TxHashDecoder,
      },
      {
        path: '/sendMultisigTx',
        name: 'Send Multisig Transaction',
        component: SendMultisigTx,
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
      {
        path: '/KIP7Deploy',
        name: 'Deploy KIP-7 Token',
        component: KIP7Deploy,
      },
      {
        path: '/KIP17Deploy',
        name: 'Deploy KIP-17 Token',
        component: KIP17Deploy,
      },
      {
        path: '/KIP37Deploy',
        name: 'Deploy KIP-37 Token',
        component: KIP37Deploy,
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
        path: '/accountUpdateToRoleBasedKey',
        name: 'Update to RoleBasedKey Account',
        component: AccountUpdateWithRoleBasedKey,
      },
      {
        path: '/checkAccountKey',
        name: 'Check Account Key Type by Address',
        component: CheckAccountKey,
      },
    ],
  },
]

export default routes
