import { ReactElement, useState } from 'react'

import {
  Label,
  Text,
  FormInput,
  Button,
  CardSection,
  CodeBlock,
  View,
  CardExample,
} from 'components'

const AddToken = (): ReactElement => {
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [decimal, setDecimal] = useState('')
  const [url, setUrl] = useState('')
  const [success, setSuccess] = useState('')

  const exToken = {
    'Token Contract Address': '0xEa51fb63dD8cfc8574BB158054D86CA786e00F87',
    'Token Symbol': 'BONG',
    'Token Decimals': '18',
    'Token Image (URL)':
      'https://avatars3.githubusercontent.com/u/32095134?s=460&v=4',
  }

  type ResultType = {
    id: string
    jsonrpc: string
    result: boolean
  }

  const add = (): void => {
    const { klaytn } = window

    try {
      klaytn.sendAsync(
        {
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: decimal,
              image: url,
            },
          },
          id: Math.round(Math.random() * 100000),
        },
        (err: Object, res: ResultType) => {
          if (err) {
            setSuccess('no')
          } else if (res.result === true) {
            setSuccess('yes')
          } else if (res.result === false) {
            setSuccess('cancel')
          }
        }
      )
    } catch {
      setSuccess('no')
    }
  }

  return (
    <>
      <CardSection>
        <h4>Smart Contract Deploy (Legacy)</h4>
        <View style={{ rowGap: 10 }}>
          <CardExample
            exValue={JSON.stringify(exToken, null, 4)}
            onClickTry={(): void => {
              setTokenAddress(exToken['Token Contract Address'])
              setTokenSymbol(exToken['Token Symbol'])
              setDecimal(exToken['Token Decimals'])
              setUrl(exToken['Token Image (URL)'])
            }}
          />
          <View>
            <Label>Token Contract Address</Label>
            <FormInput
              type="text"
              placeholder="Token Address"
              onChange={setTokenAddress}
              value={tokenAddress}
            />
            <Label>Token Symbol</Label>
            <FormInput
              type="text"
              placeholder="Token Symbol"
              onChange={setTokenSymbol}
              value={tokenSymbol}
            />
            <Label>Token Decimal</Label>
            <FormInput
              type="text"
              placeholder="Token Decimal"
              onChange={setDecimal}
              value={decimal}
            />
            <Label>Token Image (URL)</Label>
            <FormInput
              type="text"
              placeholder="URL of token image"
              onChange={setUrl}
              value={url}
            />
          </View>
          <Button onClick={add}>Add to Kaikas</Button>
          <CodeBlock
            title="caver-js code"
            text={`const { klaytn } = window

klaytn.sendAsync(
  {
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals: decimal,
        image: url,
      },
    },
    id: Math.round(Math.random() * 100000),
  },
  (err, result) => { 
    console.log(err, result)
  }
)`}
          />
        </View>
      </CardSection>
      {success === 'no' && (
        <CardSection>
          <Text>Please input the appropriate values.</Text>
        </CardSection>
      )}
      {success === 'yes' && (
        <CardSection>
          <Text>
            The token was added successfully or the token has already been
            added. Check the token list in the Kaikas.
          </Text>
        </CardSection>
      )}
      {success === 'cancel' && (
        <CardSection>
          <Text>Token addition canceled.</Text>
        </CardSection>
      )}
    </>
  )
}

export default AddToken
