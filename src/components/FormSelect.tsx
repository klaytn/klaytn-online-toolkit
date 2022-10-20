import _ from 'lodash'
import styled from 'styled-components'

const StyledSelect = styled.select`
  width: fit-content;
  min-width: 200px;
  border-color: gray;
`

type FormSelectProps<T> = {
  itemList: { label: string; value: T }[]
  onChange: (value: T) => void
}

const FormSelect = <T extends number | string>({
  itemList,
  onChange,
}: FormSelectProps<T>) => (
  <StyledSelect
    onChange={(e) => onChange(e.target.value as T)}
    className="form-control"
  >
    {_.map(itemList, (item, i) => (
      <option key={i} value={item.value}>
        {item.label}
      </option>
    ))}
  </StyledSelect>
)

export default FormSelect
