import { ReactElement } from 'react'
import styled from 'styled-components'

import Row from './Row'
import View from './View'
import Button from './Button'
import CodeBlock from './CodeBlock'

const StyledContainer = styled(View)`
  gap: 4px;
  margin-bottom: 8px;
`
const CardExample = ({
  exValue,
  onClickTry,
}: {
  exValue: string
  onClickTry: (value: string) => void
}): ReactElement => {
  return (
    <StyledContainer>
      <Row style={{ gap: 4, alignItems: 'center' }}>
        <Button
          size="sm"
          onClick={(): void => {
            onClickTry(exValue)
          }}
          style={{ fontSize: 14 }}
        >
          Try it out
        </Button>
      </Row>
      <CodeBlock text={exValue} toggle={false} />
    </StyledContainer>
  )
}

export default CardExample
