import { STYLE } from 'consts'
import { ReactElement, ReactNode } from 'react'
import styled from 'styled-components'

import View from './View'

type ContainerType = {
  children: ReactNode
}

const StyledContainer = styled(View)`
  position: relative;
  width: 100%;
  margin: 0 auto;
  align-items: center;
  max-width: 1000px;

  @media ${STYLE.media.tablet} {
    padding: 0 20px;
  }
`

const Container = ({ children }: ContainerType): ReactElement => {
  return <StyledContainer>{children}</StyledContainer>
}

export default Container
