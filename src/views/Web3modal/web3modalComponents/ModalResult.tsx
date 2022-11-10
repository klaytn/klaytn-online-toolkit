import { ReactElement } from 'react'
import styled from 'styled-components'
import _ from 'lodash'

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`

interface IResultTableStyleProps {
  nested?: boolean
}

const STable = styled(SContainer)<IResultTableStyleProps>`
  flex-direction: column;
  min-height: ${({ nested }): string => (nested ? 'auto' : '200px')};
  text-align: left;
`

const SRow = styled.div<IResultTableStyleProps>`
  width: 100%;
  display: ${({ nested }): string => (nested ? 'block' : 'flex')};
  margin: 6px 0;
`

const SKey = styled.div<IResultTableStyleProps>`
  width: ${({ nested }): string => (nested ? '100%' : '30%')};
  font-weight: 700;
`

const SValue = styled.div<IResultTableStyleProps>`
  width: ${({ nested }): string => (nested ? '100%' : '70%')};
  font-family: monospace;
`

function ModalResult(props: any): ReactElement {
  if (!props.children) {
    return <></>
  }
  const result = props.children

  return (
    <STable nested={props.nested}>
      {Object.keys(result).map((key) => {
        const nested = _.isObject(result[key])
        return (
          <SRow nested={nested} key={key}>
            <SKey nested={nested}>{key}</SKey>
            <SValue nested={nested}>
              {nested ? (
                <ModalResult nested={nested}>{result[key]}</ModalResult>
              ) : (
                _.toString(result[key])
              )}
            </SValue>
          </SRow>
        )
      })}
    </STable>
  )
}

export default ModalResult
