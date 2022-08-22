import React, { ReactElement } from 'react'
import { FormGroup, Input, InputGroupText } from 'reactstrap'
import { InputType } from 'reactstrap/types/lib/Input'
import Row from './Row'

type InputFieldType = {
  value?: string
  label?: string
  name?: string
  placeholder: string
  type?: InputType
  unit?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  readOnly?: boolean
  accept?: string
}

const InputField = ({
  value,
  label,
  name,
  placeholder,
  type,
  unit,
  onChange,
  readOnly,
  accept,
}: InputFieldType): ReactElement => (
  <FormGroup>
    {<label>{label}</label>}
    <Row>
      <Input
        accept={accept}
        type={type}
        value={value}
        name={name}
        className="form-control"
        placeholder={placeholder}
        onChange={onChange}
        readOnly={readOnly}
      />
      {unit && <InputGroupText>{unit}</InputGroupText>}
    </Row>
  </FormGroup>
)

export default InputField
