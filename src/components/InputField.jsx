import { FormGroup, Input, InputGroupText } from 'reactstrap'
import Row from './Row'

const InputField = ({
  value,
  label,
  name,
  placeholder,
  type,
  unit,
  onChange,
  readOnly,
}) => (
  <FormGroup>
    {<label>{label}</label>}
    <Row>
      <Input
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
