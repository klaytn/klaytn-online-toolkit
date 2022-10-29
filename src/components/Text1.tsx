import { HTMLAttributes, ReactElement } from 'react'
import styled from 'styled-components'

import { COLOR } from 'consts'

const StyledText = styled.div`
  color: ${COLOR.text};
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  white-space: pre-wrap;
  word-break: break-word;
`

const Text1 = (props: HTMLAttributes<HTMLDivElement>): ReactElement => {
  return <StyledText {...props} />
}

export default Text1
