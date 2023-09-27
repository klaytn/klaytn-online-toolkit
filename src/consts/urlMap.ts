const network = {
  testnet: {
    rpc: 'https://klaytn-baobab-rpc.allthatnode.com:8551',
    scope: 'https://baobab.scope.klaytn.com/tx/',
    finder: 'https://baobab.klaytnfinder.io/tx/',
    finderToken: 'https://baobab.klaytnfinder.io/token/',
    finderNFT: 'https://baobab.klaytnfinder.io/nft/',
  },
  mainnet: {
    rpc: 'https://klaytn-mainnet-rpc.allthatnode.com:8551',
    scope: 'https://scope.klaytn.com/tx/',
    finder: 'https://www.klaytnfinder.io/tx/',
    finderToken: 'https://www.klaytnfinder.io/token/',
    finderNFT: 'https://www.klaytnfinder.io/nft/',
  },
}

const kip = {
  'KIP-7': 'https://kips.klaytn.foundation/KIPs/kip-7',
  'KIP-17': 'https://kips.klaytn.foundation/KIPs/kip-17',
  'KIP-37': 'https://kips.klaytn.foundation/KIPs/kip-37',
}

export default {
  network,
  kip,
}
