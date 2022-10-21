import _ from 'lodash'
import styled from 'styled-components'

const StyledSelect = styled.select`
  width: fit-content;
  min-width: 200px;
  border-color: gray;
  max-width: 100%;
`

type FormSelectProps<T> = {
  defaultValue: T
  itemList: { label: string; value: T }[]
  onChange: (value: T) => void
}

const FormSelect = <T,>({
  defaultValue,
  itemList,
  onChange,
}: FormSelectProps<T>) => (
  <StyledSelect
    onChange={(e) => onChange(e.target.value as T)}
    className="form-control"
    defaultValue={defaultValue as string}
  >
    {_.map(itemList, (item, i) => (
      <option key={i} value={item.value as string}>
        {item.label}
      </option>
    ))}
  </StyledSelect>
)

export default FormSelect
