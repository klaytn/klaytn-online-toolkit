import GenerateKeystore from "./views/generateKeystore";
import KeccakFromString from "./views/keccak256";
import LoadKeystore from "./views/loadKeystore";
import SendAndSignTx from "./views/multisigTx";
import AccountUpdate from "./views/AccountUpdate";
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
            }
        ]
    },
    {
        name: "Smart Contract",
        path: "/smartcontract",
        items: [
            {
                path: "/ABIEncoder",
                name: "ABI Encoder",
                component: null,
            },
            {
                path: "/ABIDecoder",
                name: "ABI Decoder",
                component: null,
            },
            {
                path: "/functionCall",
                name: "Function Call with ABI & Params",
                component: null,
            },
            {
                path: "/functionSig",
                name: "Function Signature Generator",
                component: null,
            },
            {
                path: "/KCTDetection",
                name: "KCT Detection",
                component: null,
            },
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
                path: "/accountUpdate",
                name: "Update Account with MultiSigKey",
                component: AccountUpdate,
            }
        ]
    }]

export default routes;