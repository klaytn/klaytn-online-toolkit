import { ReactElement } from 'react'
import styled from 'styled-components'

import { View, Card, CardBody } from 'components'

const StyledContainer = styled(View)``

const Home = (): ReactElement => {
  return (
    <StyledContainer>
      <Card>
        <CardBody>
          <h3 style={{ fontWeight: '600' }}> Klaytn Online Toolkit </h3>
          <p>
            <a href="https://github.com/klaytn/klaytn-online-toolkit">
              Klaytn-online-toolkit
            </a>
            provides code samples and github-page to help you utilize the Klaytn
            SDK(caver-js).
          </p>
        </CardBody>
      </Card>
    </StyledContainer>
  )
}

export default Home
