import { ReactElement } from 'react'
import styled from 'styled-components'
import { Card, CardBody } from 'reactstrap'

import { View } from 'components'

const StyledContainer = styled(View)``

const Main = (): ReactElement => {
  return (
    <StyledContainer>
      <Card>
        <CardBody>
          <h3 style={{ fontWeight: '600' }}> Klaytn Online Toolkit </h3>
          <p>
            <a href="https://github.com/klaytn/klaytn-online-toolkit">
              Klaytn-online-toolkit
            </a>{' '}
            provides code samples and github-page to help you utilize the Klaytn
            SDK(caver-js).
          </p>
        </CardBody>
      </Card>
    </StyledContainer>
  )
}

export default Main
