import GenerateKeystore from "./views/generateKeystore";
import KeccakFromString from "./views/keccak256";
import LoadKeystore from "./views/loadKeystore";
import SendAndSignTx from "./views/multisigTx";
import AccountUpdateWithMultiSigKey from "./views/AccountUpdateMultiSig";
import DetectKCT from "./views/detectKCT";
import FunctionSignature from "./views/functionSignature";
import FunctionCall from "./views/functionCall";
import ABIEncoder from "./views/ABIEncoder";
import ABIDecoder from "./views/ABIDecoder";
import AccountUpdateWithRoleBasedKey from "./views/AccountUpdateRoleBased";
import KIP7Deploy from "./views/KIP7Deploy";

var routes =
    [{
        name: "Block Info",
        path: "/blockinfo",
        items: [
            {
                path: "/rlpDecode",
                name: "Decoder from RLP",
                component: null,
            },
            {
                path: "/blockhashDecode",
                name: "Decoder from BlockHash",
                component: null,
            }
        ]
    },
    {
        name: "Transaction",
        path: "/transaction",
        items: [
            {
                path: "/rlpEncode",
                name: "RLP Encoder",
                component: null,
            },
            {
                path: "/rlpDecode",
                name: "Decoder from RLP",
                component: null,
            },
            {
                path: "/txHashDecode",
                name: "Decoder from txHash",
                component: null
            },
            {
                path:"/sendMultisigTx",
                name: "Send Multisig Transaction",
                component: SendAndSignTx
            },
        ]
    },
    {
        name: "Smart Contract",
        path: "/smartcontract",
        items: [
            {
                path: "/ABIEncoder",
                name: "ABI Encoder",
                component: ABIEncoder,
            },
            {
                path: "/ABIDecoder",
                name: "ABI Decoder",
                component: ABIDecoder,
            },
            {
                path: "/functionCall",
                name: "Function Call with ABI & Params",
                component: FunctionCall,
            },
            {
                path: "/functionSig",
                name: "Encode Function Signature",
                component: FunctionSignature,
            },
            {
                path: "/KCTDetection",
                name: "KCT Detection",
                component: DetectKCT,
            },
            {
                path: "/KIP7Deploy",
                name: "Deploy KIP-7 Token",
                component: KIP7Deploy,
            }
        ]
    },
    {
        name: "Miscellaneous",
        path: "/misc",
        items: [
            {
                path: "/loadKeystore",
                name: "Load Keystore",
                component: LoadKeystore,
            },
            {
                path: "/generateKeystore",
                name: "Generate Keystore",
                component: GenerateKeystore,
            },
            {
                path: "/hashFromStr",
                name: "Hash From String(Keccak256)",
                component: KeccakFromString
            },
            {
                path: "/accountUpdateWithMultiSigKey",
                name: "Update Account with MultiSigKey",
                component: AccountUpdateWithMultiSigKey,
            },
            {
                path: "/accountUpdateWithRoleBasedKey",
                name: "Update Account with RoleBasedKey",
                component: AccountUpdateWithRoleBasedKey,
            }
        ]
    }]

export default routes;