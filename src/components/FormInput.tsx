import styled from 'styled-components'

const StyledInput = styled.input`
  background-color: #adb5bd;
  color: black;
  padding: 10px;
  font-size: 12px;
  border: none;
  border-radius: 5px;

  :focus-visible {
    outline: 1px solid gray;
  }

  :read-only {
    color: white;
    background-color: #6c7379;
    cursor: not-allowed;
  }

  :read-only:focus-visible {
    outline: none;
  }
`

type FormInputProps = {
  type?: 'text' | 'password' | 'number'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  readonly?: boolean
  style?: object
}

const FormInput = (props: FormInputProps) => {
  const { onChange, ...rest } = props
  return (
    <StyledInput onChange={(e): void => onChange(e.target.value)} {...rest} />
  )
}

export default FormInput
