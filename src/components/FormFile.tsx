import styled from 'styled-components'

const StyledFile = styled.input``

type FormFileProps = {
  accept: string
  onChange: (accept?: FileList) => void
  placeholder?: string
}

const FormFile = ({ accept, placeholder, onChange }: FormFileProps) => (
  <StyledFile
    className="form-control"
    type="file"
    accept={accept}
    onChange={(e): void => onChange(e.target.files || undefined)}
    placeholder={placeholder}
  />
)

export default FormFile
