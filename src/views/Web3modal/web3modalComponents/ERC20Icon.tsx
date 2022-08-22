import * as PropTypes from 'prop-types'
import Icon from './Icon'
import erc20 from 'images/erc20.svg'
import { ReactElement } from 'react'

const ERC20Icon = (props: any): ReactElement => {
  const src = `https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/${props.contractAddress.toLowerCase()}.png`
  return <Icon src={src} fallback={erc20} />
}

ERC20Icon.propTypes = {
  contractAddress: PropTypes.string,
  size: PropTypes.number,
}

ERC20Icon.defaultProps = {
  contractAddress: null,
  size: 20,
}

export default ERC20Icon
