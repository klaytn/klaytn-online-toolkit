import styled from 'styled-components'
import logo from 'images/web3modal-logo.png'
import { ReactElement } from 'react'

const SBannerWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  & span {
    color: 'lightBlue';
    margin-left: 12px;
  }
`

const SBanner = styled.div`
  width: 45px;
  height: 45px;
  background: url(${logo}) no-repeat;
  background-size: cover;
  background-position: center;
`

const Banner = (): ReactElement => (
  <SBannerWrapper>
    <SBanner />
    <span>{`Web3Modal`}</span>
  </SBannerWrapper>
)

export default Banner
