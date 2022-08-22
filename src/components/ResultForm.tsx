import { ReactElement, useMemo } from 'react'

import { COLOR } from 'consts'
import { View, Label, CodeBlock, Text } from 'components'
import { ResultFormType } from 'types'

import CardSection from './CardSection'

const ResultForm = <T,>({
  result,
  title,
}: {
  result?: ResultFormType<T>
  title?: string
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
            <View>
              <Label>{title || 'Result'}</Label>
              <CodeBlock toggle={false} text={resultStr} />
            </View>
          ) : (
            <Text style={{ color: COLOR.error }}> {result.message} </Text>
          )}
        </CardSection>
      )}
    </>
  )
}

export default ResultForm
