import { ReactElement } from 'react'
import styled from 'styled-components'
import _ from 'lodash'

import { STYLE } from 'consts'

import { Text, Row } from 'components'

const StyledRadioMenu = styled(Row)`
  gap: 8px;
  overflow: hidden;
  padding-right: 20px;
`

const StyledRadioItem = styled(Row)<{ selected: boolean }>`
  ${STYLE.clickable};
  border-radius: 300px;
  border: 3px solid;
  border-color: ${({ selected }): string => (selected ? '#1d8cf8' : 'gray')};
  padding: 8px 16px;
  white-space: nowrap;
`

export type ItemListType<T> = {
  title: string
  value: T
}[]

const FormRadio = <T,>({
  selectedValue,
  itemList,
  onClick,
}: {
  selectedValue: T
  itemList: ItemListType<T>
  onClick: (value: T) => void
}): ReactElement => {
  const RadioItem = ({
    value,
    title,
  }: {
    value: T
    title: string
  }): ReactElement => {
    const selected = value === selectedValue

    return (
      <StyledRadioItem
        selected={selected}
        onClick={(): void => {
          onClick(value)
        }}
      >
        <Text style={{ color: selected ? '#1d8cf8' : 'gray' }}>{title}</Text>
      </StyledRadioItem>
    )
  }

  return (
    <StyledRadioMenu>
      {_.map(itemList, (x) => (
        <RadioItem
          key={`itemList-${x.value}`}
          value={x.value}
          title={x.title}
        />
      ))}
    </StyledRadioMenu>
  )
}

export default FormRadio
