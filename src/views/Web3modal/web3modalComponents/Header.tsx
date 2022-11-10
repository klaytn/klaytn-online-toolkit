import { ReactElement } from 'react'
import styled from 'styled-components'
import * as PropTypes from 'prop-types'
import { getChainData } from '../helpers/utilities'
import Banner from './Banner'

export const transitions = {
  short: 'all 0.1s ease-in-out',
  base: 'all 0.2s ease-in-out',
  long: 'all 0.3s ease-in-out',
  button: 'all 0.15s ease-in-out',
}

const SHeader = styled.div`
  margin-top: -1px;
  margin-bottom: 1px;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`

const SActiveAccount = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  font-weight: 500;
`

const SActiveChain = styled(SActiveAccount)`
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  & p {
    font-size: 0.8em;
    margin: 0;
    padding: 0;
  }
  & p:nth-child(2) {
    font-weight: bold;
  }
`

interface IHeaderStyle {
  connected: boolean
}
const SAddress = styled.p<IHeaderStyle>`
  transition: ${transitions.base};
  font-weight: bold;
  margin: ${({ connected }): string => (connected ? '-2px auto 0.7em' : '0')};
`

const SDisconnect = styled.div<IHeaderStyle>`
  transition: ${transitions.button};
  font-size: 12px;
  font-family: monospace;
  position: absolute;
  right: 0;
  top: 20px;
  opacity: 0.7;
  cursor: pointer;

  opacity: ${({ connected }): number => (connected ? 1 : 0)};
  visibility: ${({ connected }): string => (connected ? 'visible' : 'hidden')};
  pointer-events: ${({ connected }): string => (connected ? 'auto' : 'none')};

  &:hover {
    transform: translateY(-1px);
    opacity: 0.5;
  }
`

interface IHeaderProps {
  killSession: () => void
  connected: boolean
  address: string
  chainId: number
}

const Header = (props: IHeaderProps): ReactElement => {
  const { connected, address, chainId, killSession } = props
  const chainData = chainId ? getChainData(chainId) : null
  return (
    <SHeader {...props}>
      {connected && chainData ? (
        <SActiveChain>
          <p>{`Connected to`}</p>
          <p>{chainData.name}</p>
        </SActiveChain>
      ) : (
        <Banner />
      )}
      {address && (
        <SActiveAccount>
          <SAddress connected={connected}>{address}</SAddress>
          <SDisconnect connected={connected} onClick={killSession}>
            {'Disconnect'}
          </SDisconnect>
        </SActiveAccount>
      )}
    </SHeader>
  )
}

Header.propTypes = {
  killSession: PropTypes.func.isRequired,
  address: PropTypes.string,
}

export default Header
