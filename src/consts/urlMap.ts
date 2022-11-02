const network = {
  testnet: {
    rpc: 'https://api.baobab.klaytn.net:8651',
    finder: 'https://baobab.klaytnfinder.io/tx/',
    finderToken: 'https://baobab.klaytnfinder.io/token/',
    finderNFT: 'https://baobab.klaytnfinder.io/nft/',
  },
  mainnet: {
    rpc: 'https://public-node-api.klaytnapi.com/v1/cypress',
    finder: 'https://www.klaytnfinder.io/tx/',
    finderToken: 'https://www.klaytnfinder.io/token/',
    finderNFT: 'https://www.klaytnfinder.io/nft/',
  },
}

const kip: { [key: string]: string } = {
  'KIP-7': 'https://kips.klaytn.foundation/KIPs/kip-7',
  'KIP-17': 'https://kips.klaytn.foundation/KIPs/kip-17',
  'KIP-37': 'https://kips.klaytn.foundation/KIPs/kip-37',
}

export default {
  network,
  kip,
}
