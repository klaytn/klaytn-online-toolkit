import { ReactElement } from 'react'
import _ from 'lodash'
import styled from 'styled-components'

import { View, Text, Container, LinkA, CodeBlock } from 'components'
import { COLOR } from 'consts'
import routes from 'routes'

const StyledView = styled(View)`
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  gap: 10px;
`
const BorderLine = styled(View)`
  border-bottom: solid ${COLOR.landingPageCard};
  width: 100%;
`
const StyledCard = styled(View)`
  border-radius: 20px;
  padding: 15px 20px 15px 20px;
  background-color: ${COLOR.landingPageCard};
  box-shadow: 5px 5px 5px black;
`
const StyledGridV = styled(View)`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  margin-bottom: 20px;
`

const Main = (): ReactElement => {
  return (
    <Container>
      <StyledView>
        <Text style={{ fontSize: '40px', fontWeight: '600' }}>
          Klaytn Online Toolkit
        </Text>
      </StyledView>
      <BorderLine />
      <StyledView style={{ paddingBottom: '10px' }}>
        <Text style={{ fontSize: '30px', fontWeight: '600' }}>
          Install Caver-js
        </Text>
        <Text style={{ fontSize: '15px' }}>
          <LinkA link="https://github.com/klaytn/caver-js">caver-js</LinkA> is a
          JavaScript API library that allows developers to interact with a
          Klaytn node using a HTTP or Websocket connection. To install, paste
          that in a macOS Terminal or Linux shell prompt.
        </Text>
        <CodeBlock toggle={false} text="npm install caver-js        " />
      </StyledView>
      <BorderLine />
      <StyledView>
        <Text style={{ fontSize: '30px', fontWeight: '600' }}>
          What Does Klaytn Online Toolkit Do?
        </Text>
        <Text style={{ fontSize: '15px', paddingBottom: '10px' }}>
          <LinkA link="https://github.com/klaytn/klaytn-online-toolkit">
            Klaytn-online-toolkit
          </LinkA>{' '}
          provides code samples and pages to help you utilize the Klaytn
          SDK(caver-js).
        </Text>
        <StyledGridV>
          {_.map(
            routes,
            (prop) =>
              prop.name !== 'Web3Modal' && (
                <StyledCard>
                  <View style={{ alignItems: 'center', paddingBottom: '8px' }}>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: '18px',
                      }}
                    >
                      {prop.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '100%',
                      borderTop: 'solid',
                      paddingBottom: '10px',
                    }}
                  ></View>
                  {_.map(prop.items, (item) => (
                    <Text>
                      <a href={prop.path + item.path}>{item.name}</a>:{' '}
                      {item.description}
                    </Text>
                  ))}
                </StyledCard>
              )
          )}
        </StyledGridV>
      </StyledView>
      <BorderLine />
      <StyledView>
        <Text style={{ fontSize: '30px', fontWeight: '600' }}>
          Web3Modal Example
        </Text>
        <Text style={{ fontSize: '15px', paddingBottom: '10px' }}>
          Web3modal examples are derived from{' '}
          <LinkA link="https://github.com/WalletConnect/web3modal/tree/V1/example">
            web3modal/example
          </LinkA>{' '}
          and modified to add Kaikas wallet and Klip wallet. You can add support
          for multiple providers including Kaikas provider and Klip wallet
          provider by using{' '}
          <LinkA link="https://github.com/klaytn/klaytn-web3modal">
            @klaytn/web3modal
          </LinkA>
          . We have created a PR in web3modal repo, which is still under review.
          So we temporarily provide{' '}
          <LinkA link="https://github.com/klaytn/klaytn-web3modal">
            @klaytn/web3modal
          </LinkA>{' '}
          package.
        </Text>
        {_.map(
          routes,
          (prop) =>
            prop.name === 'Web3Modal' && (
              <StyledCard>
                {_.map(prop.items, (item) => (
                  <Text>
                    <a href={prop.path + item.path}>{item.name}</a>:{' '}
                    {item.description}
                  </Text>
                ))}
              </StyledCard>
            )
        )}
      </StyledView>
      <BorderLine />
      <StyledView>
        <LinkA link="https://docs.klaytn.foundation/">
          <StyledCard>
            <Text>Klaytn Documentation</Text>
          </StyledCard>
        </LinkA>
      </StyledView>
    </Container>
  )
}

export default Main
