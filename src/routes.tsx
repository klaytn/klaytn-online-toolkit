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
import AccountUpdateToMultiSigKey from 'views/Miscellaneous/MultisigAccountUpdate'

import Web3modalExample from './views/Web3modal'
import Web3modalNFT from './views/Web3modal/web3modalNFT'

import { RouteType } from 'types'

const routes: RouteType[] = [
  {
    name: 'Transaction',
    path: '/transaction',
    items: [
      {
        path: '/sendMultisigTx',
        name: 'Send Multisig Transaction',
        component: SendMultisigTx,
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
        path: '/checkAccountKey',
        name: 'Check Account Key Type by Address',
        component: CheckAccountKey,
      },
      {
        path: '/accountUpdateMultisig',
        name: 'Account Update to Multisig Key',
        component: AccountUpdateToMultiSigKey,
      },
    ],
  },
]

export default routes
