import { ReactElement } from 'react'
import { CopyBlock, dracula } from 'react-code-blocks'
import useToast from 'hooks/useToast'

const CodeBlock = ({
  toggle = true,
  text,
  title,
}: {
  toggle?: boolean
  text: string
  title?: string
}): ReactElement => {
  const { toast } = useToast()

  const Block = () => (
    <CopyBlock
      text={text}
      language="typescript"
      showLineNumbers
      codeBlock
      theme={dracula}
      onCopy={(): void => {
        toast('Copied')
      }}
    />
  )

  return toggle ? (
    <details>
      <summary style={{ color: '#50fa7b' }}>{title || 'Code'}</summary>
      <Block />
    </details>
  ) : (
    <Block />
  )
}

export default CodeBlock
