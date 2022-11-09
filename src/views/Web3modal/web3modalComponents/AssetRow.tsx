import styled from 'styled-components'
import Icon from './Icon'
import ERC20Icon from './ERC20Icon'
import KlaytnIcon from 'images/klaytn-logo.png'
import eth from 'images/eth.svg'
import { UTIL } from 'consts'

const SAssetRow = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
`
const SAssetRowLeft = styled.div`
  display: flex;
`
const SAssetName = styled.div`
  display: flex;
  margin-left: 10px;
`
const SAssetRowRight = styled.div`
  display: flex;
`
const SAssetBalance = styled.div`
  display: flex;
`

const AssetRow = (props: any) => {
  const { asset } = props
  const nativeCurrencyIcon =
    asset.symbol && asset.symbol.toLowerCase() === 'eth'
      ? eth
      : asset.symbol.toLowerCase() === 'klay'
      ? KlaytnIcon
      : null
  return (
    <SAssetRow {...props}>
      <SAssetRowLeft>
        {nativeCurrencyIcon ? (
          <Icon src={nativeCurrencyIcon} />
        ) : (
          <ERC20Icon contractAddress={asset.contractAddress.toLowerCase()} />
        )}
        <SAssetName>{asset.name}</SAssetName>
      </SAssetRowLeft>
      <SAssetRowRight>
        <SAssetBalance>
          {`${UTIL.toBn(asset.balance).dividedBy(Math.pow(10, 18))} ${
            asset.symbol
          }`}
        </SAssetBalance>
      </SAssetRowRight>
    </SAssetRow>
  )
}

export default AssetRow
