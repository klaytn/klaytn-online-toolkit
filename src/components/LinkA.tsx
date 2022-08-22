import { COLOR } from 'consts'
import { ReactElement, ReactNode } from 'react'
import styled from 'styled-components'

import Text from './Text'

const StyledA = styled.a`
  color: ${COLOR.primary};
  text-decoration: none;
  :hover {
    opacity: 1;
  }
  :visited {
    color: ${COLOR.primary};
  }
`

const LinkA = ({
  link,
  children,
}: {
  link: string
  children?: ReactNode
}): ReactElement => {
  return (
    <StyledA href={link} target="_blank" rel="noopener noreferrer">
      {children || <Text color={COLOR.primary}>{link}</Text>}
    </StyledA>
  )
}

export default LinkA
