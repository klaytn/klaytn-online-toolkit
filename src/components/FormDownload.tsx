import { ReactElement } from 'react'
import Button from './Button'

type FormDownloadProps = {
  title?: string
  fileName: string
  fileData: string
}

const FormDownload = ({
  title,
  fileName,
  fileData,
}: FormDownloadProps): ReactElement => {
  const onClick = (): void => {
    const date = new Date()
    const filename = `${fileName}-${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}.json`
    let element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8,' + encodeURIComponent(fileData)
    )
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return <Button onClick={onClick}>{title || 'Download'}</Button>
}

export default FormDownload
