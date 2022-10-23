import { ReactElement, useMemo } from 'react'
import _ from 'lodash'

import { COLOR } from 'consts'
import { View, Label, FormTextarea, CopyButton, Text } from 'components'
import { ResultFormType } from 'types'

const ResultForm = <T,>({
  result,
  height = 200,
  title,
}: {
  result?: ResultFormType<T>
  height?: number
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
        <>
          {result.success ? (
            <View>
              <Label>{title || 'Result'}</Label>
              <FormTextarea style={{ height }} value={resultStr} readOnly />
              <CopyButton text={resultStr}>Copy the result</CopyButton>
            </View>
          ) : (
            <Text style={{ color: COLOR.error }}> {result.message} </Text>
          )}
        </>
      )}
    </>
  )
}

export default ResultForm
