import { ReactElement } from 'react'
import _ from 'lodash'

import { COLOR } from 'consts'
import { View, Label, FormTextarea, CopyButton, Text } from 'components'
import { ResultFormType } from 'types'

const ResultForm = ({
  result,
  height = 200,
}: {
  result?: ResultFormType
  height?: number
}): ReactElement => {
  return (
    <>
      {result && (
        <>
          {result.success ? (
            <View>
              <Label>Result</Label>
              <FormTextarea style={{ height }} value={result.value} readOnly />
              <CopyButton text={result.value}>Copy the result</CopyButton>
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
