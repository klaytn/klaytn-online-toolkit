import { ReactElement, useMemo } from 'react'
import { Keystore } from 'caver-js'

import { COLOR } from 'consts'
import {
  View,
  Label,
  CodeBlock,
  Text,
  CardSection,
  FormDownload,
  LinkA,
  Row,
  Button,
} from 'components'
import { ResultFormType } from 'types'

const KeystoreResultForm = ({
  result,
  title,
  keystoreName,
}: {
  result?: ResultFormType<Keystore>
  title?: string
  keystoreName?: string
}): ReactElement => {
  const resultStr = useMemo(() => {
    if (result?.success) {
      return typeof result.value === 'string'
        ? result.value
        : JSON.stringify(result.value, null, 2)
    }
    return ''
  }, [result])

  return (
    <>
      {result && (
        <CardSection>
          {result.success ? (
            <>
              <Label>{title || 'Result'}</Label>
              <View style={{ rowGap: 10 }}>
                <CodeBlock toggle={false} text={resultStr} />
                <FormDownload
                  fileData={JSON.stringify(result.value, null, 2)}
                  fileName={keystoreName || `keystore-${result.value?.address}`}
                />
                <LinkA link="https://baobab.wallet.klaytn.foundation/faucet">
                  <Row style={{ gap: 4, alignItems: 'center' }}>
                    <Text style={{ color: COLOR.primary }}>
                      Get some testnet KLAY
                    </Text>
                    <Button size="sm">Move to get KLAY</Button>
                  </Row>
                </LinkA>
                <Row style={{ gap: 4, alignItems: 'center' }}>
                  <Text>Address : </Text>
                  <View style={{ flex: 1 }}>
                    <CodeBlock text={result.value?.address!} toggle={false} />
                  </View>
                </Row>
              </View>
            </>
          ) : (
            <Text style={{ color: COLOR.error }}> {result.message} </Text>
          )}
        </CardSection>
      )}
    </>
  )
}

export default KeystoreResultForm
