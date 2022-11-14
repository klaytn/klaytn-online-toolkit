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
              <View style={{ paddingBottom: 10 }}>
                <CodeBlock toggle={false} text={resultStr} />
              </View>
              <FormDownload
                fileData={JSON.stringify(result.value, null, 2)}
                fileName={keystoreName || `keystore-${result.value?.address}`}
              />
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
