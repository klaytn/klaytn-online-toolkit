import styled from 'styled-components'

const StyledInput = styled.input`
  background-color: #adb5bd;
  color: black;
`

type FormInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const FormInput = ({ value, placeholder, onChange }: FormInputProps) => (
  <StyledInput
    className="form-control"
    value={value}
    onChange={(e): void => onChange(e.target.value)}
    placeholder={placeholder}
  />
)

export default FormInput
