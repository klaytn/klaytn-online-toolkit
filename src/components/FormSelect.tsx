import _ from 'lodash'
import { CSSProperties } from 'react'
import styled from 'styled-components'

const StyledSelect = styled.select`
  width: fit-content;
  border-color: gray;
  max-width: 100%;
`

type FormSelectProps<T> = {
  defaultValue: T
  itemList: { label: string; value: T }[]
  onChange: (value: T) => void
  containerStyle?: CSSProperties
}

const FormSelect = <T extends string | number>({
  defaultValue,
  itemList,
  onChange,
  containerStyle,
}: FormSelectProps<T>) => (
  <StyledSelect
    onChange={(e) => onChange(e.target.value as T)}
    className="form-control"
    defaultValue={defaultValue as T}
    style={containerStyle}
  >
    {_.map(itemList, (item, i) => (
      <option key={i} value={item.value as T}>
        {item.label}
      </option>
    ))}
  </StyledSelect>
)

export default FormSelect
