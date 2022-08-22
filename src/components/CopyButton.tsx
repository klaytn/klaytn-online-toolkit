import { ReactElement } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ButtonProps } from 'reactstrap'

import useToast from 'hooks/useToast'
import Button from './Button'

const CopyButton = ({
  text,
  children,
  buttonProps,
}: {
  text: string
  children: string
  buttonProps?: ButtonProps
}): ReactElement => {
  const { toast } = useToast()

  return (
    <CopyToClipboard
      text={text}
      onCopy={(): void => {
        toast('Copied')
      }}
    >
      <Button {...buttonProps}>{children}</Button>
    </CopyToClipboard>
  )
}

export default CopyButton
