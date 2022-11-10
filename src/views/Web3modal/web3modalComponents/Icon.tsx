import * as PropTypes from 'prop-types'
import { ReactElement } from 'react'
import styled from 'styled-components'

interface IIconStyleProps {
  size: number
}

const SIcon = styled.img<IIconStyleProps>`
  width: ${({ size }): string => `${size}px`};
  height: ${({ size }): string => `${size}px`};
`

const Icon = (props: any): ReactElement => {
  const { src, fallback, size } = props
  return (
    <SIcon
      {...props}
      src={src}
      size={size}
      onError={(event: any): void => (event.target.src = fallback)}
    />
  )
}

Icon.propTypes = {
  src: PropTypes.string,
  fallback: PropTypes.string,
  size: PropTypes.number,
}

Icon.defaultProps = {
  src: null,
  fallback: null,
  size: 20,
}

export default Icon
