import React  from "react";
import {Row, Col, FormGroup, InputGroup, Input, InputGroupText} from "reactstrap"
import '../../assets/css/black-dashboard-react.css'

const InputField = ({ value, label, name, placeholder, type, unit, onChange }) => (
  <FormGroup>
    {<label>{label}</label>}
    {unit != null ?
      <InputGroup>
        <Input
          type={type}
          value={value}
          name={name}
          className="form-control"
          placeholder={placeholder}
          onChange={onChange}
        />
        <InputGroupText>{unit}</InputGroupText>
      </InputGroup> :
      <Input
        type={type}
        value={value}
        name={name}
        className="form-control"
        placeholder={placeholder}
        onChange={onChange}
      />
    }
  </FormGroup>
);

export default InputField;