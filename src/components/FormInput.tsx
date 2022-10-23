import styled from 'styled-components'

const StyledInput = styled.input`
  background-color: #adb5bd;
  color: black;
`

type FormInputProps = {
  type?: 'text' | 'password'
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const FormInput = (props: FormInputProps) => {
  const { onChange, ...rest } = props
  return (
    <StyledInput
      className="form-control"
      onChange={(e): void => onChange(e.target.value)}
      {...rest}
    />
  )
}

export default FormInput
