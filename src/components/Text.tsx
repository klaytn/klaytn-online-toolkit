import { HTMLAttributes, ReactElement } from 'react'
import styled from 'styled-components'

import { COLOR } from 'consts'
import View from './View'

const StyledText = styled(View)`
  color: ${COLOR.text};
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  white-space: pre-wrap;
  word-break: break-word;
`

const Text = (props: HTMLAttributes<HTMLDivElement>): ReactElement => {
  return <StyledText {...props} />
}

export default Text
