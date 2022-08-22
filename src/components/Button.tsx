import styled from 'styled-components'
import { Button as BaseButton, ButtonProps } from 'reactstrap'
import { ReactElement } from 'react'

const StyledButton = styled(BaseButton)`
  margin-bottom: 0;
  width: fit-content;
  min-width: 100px;
`

const Button = (props: ButtonProps): ReactElement => {
  return <StyledButton {...props} />
}

export default Button
