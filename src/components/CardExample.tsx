import { ReactElement } from 'react'
import styled from 'styled-components'

import Row from './Row'
import Text from './Text'
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
        <Text style={{ fontSize: 18 }}>Example : </Text>
        <Button
          size="sm"
          onClick={(): void => {
            onClickTry(exValue)
          }}
        >
          Try
        </Button>
      </Row>
      <CodeBlock text={exValue} toggle={false} />
    </StyledContainer>
  )
}

export default CardExample
