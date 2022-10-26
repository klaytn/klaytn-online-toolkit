import { ReactElement } from 'react'
import loadingImg from 'images/loading.gif'
import FormImage from './FormImage'

const Loading = ({ size = 60 }: { size?: number }): ReactElement => {
  return <FormImage src={loadingImg} style={{ width: size, height: size }} />
}

export default Loading
