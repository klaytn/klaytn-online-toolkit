import { FormGroup, InputGroup, Input, InputGroupText } from 'reactstrap'

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
    {unit != null ? (
      <InputGroup>
        <Input
          type={type}
          value={value}
          name={name}
          className="form-control"
          placeholder={placeholder}
          onChange={onChange}
          readOnly={readOnly}
        />
        <InputGroupText>{unit}</InputGroupText>
      </InputGroup>
    ) : (
      <Input
        type={type}
        value={value}
        name={name}
        className="form-control"
        placeholder={placeholder}
        onChange={onChange}
        readOnly={readOnly}
      />
    )}
  </FormGroup>
)

export default InputField
