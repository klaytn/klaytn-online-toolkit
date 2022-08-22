import { ReactElement, TextareaHTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledTextarea = styled.textarea`
  background-color: #adb5bd;
  color: black;
  padding: 10px;
  resize: none;
  font-size: 12px;
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
type FormTextareaProps = {
  onChange?: (value: string) => void
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>

const FormTextarea = (props: FormTextareaProps): ReactElement => {
  const { onChange, ...rest } = props
  return (
    <StyledTextarea
      onChange={(e): void => onChange?.(e.target.value)}
      {...rest}
    />
  )
}

export default FormTextarea
