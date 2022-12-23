import * as React from 'react'
import styled from 'styled-components'
import * as PropTypes from 'prop-types'

export const transitions = {
  short: 'all 0.1s ease-in-out',
  base: 'all 0.2s ease-in-out',
  long: 'all 0.3s ease-in-out',
  button: 'all 0.15s ease-in-out',
}
interface ILightboxStyleProps {
  show: boolean
  offset: number
  opacity?: number
}

const SLightbox = styled.div<ILightboxStyleProps>`
  transition: opacity 0.1s ease-in-out;
  text-align: center;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  will-change: opacity;
  background-color: ${({ opacity }): string => {
    let alpha = 0.4
    if (typeof opacity === 'number') {
      alpha = opacity
    }
    return `rgba(0, 0, 0, ${alpha})`
  }};
  opacity: ${({ show }): number => (show ? 1 : 0)};
  visibility: ${({ show }): string => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }): string => (show ? 'auto' : 'none')};
  display: flex;
  justify-content: center;
  align-items: center;
`

const SModalContainer = styled.div`
  padding: 10px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  width: min(500px, 100%);
`

interface ICloseButtonStyleProps {
  size: number
  color: string
  onClick?: any
}

const SCloseButton = styled.div<ICloseButtonStyleProps>`
  transition: ${transitions.short};
  position: absolute;
  width: ${({ size }): string => `${size}px`};
  height: ${({ size }): string => `${size}px`};
  right: ${({ size }): string => `${size / 1.6667}px`};
  top: ${({ size }): string => `${size / 1.6667}px`};
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  &:before,
  &:after {
    position: absolute;
    content: ' ';
    height: ${({ size }): string => `${size}px`};
    width: 2px;
    background: ${({ color }): string => `${color}`};
  }
  &:before {
    transform: rotate(45deg);
  }
  &:after {
    transform: rotate(-45deg);
  }
`

const SCard = styled.div`
  width: min(500px, 100%);
  padding: 25px;
  background-color: white;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const SModalContent = styled.div`
  position: relative;
  width: 100%;
  position: relative;
  word-wrap: break-word;
`

interface IModalState {
  offset: number
}

interface IModalProps {
  children: React.ReactNode
  show: boolean
  toggleModal: any
  opacity?: number
}
const INITIAL_STATE = {
  offset: 0,
}

class Modal extends React.Component<IModalProps, IModalState> {
  public static propTypes = {
    children: PropTypes.node.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    opacity: PropTypes.number,
  }

  public lightbox?: HTMLDivElement | null

  public state: IModalState = {
    ...INITIAL_STATE,
  }

  public componentDidUpdate(): void {
    if (this.lightbox) {
      const lightboxRect = this.lightbox.getBoundingClientRect()
      const offset = lightboxRect.top > 0 ? lightboxRect.top : 0

      if (offset !== INITIAL_STATE.offset && offset !== this.state.offset) {
        this.setState({ offset })
      }
    }
  }

  public toggleModal = async (): Promise<void> => {
    const d = typeof window !== 'undefined' ? document : ''
    const body = d ? d.body || d.getElementsByTagName('body')[0] : ''
    if (body) {
      if (this.props.show) {
        body.style.position = ''
      } else {
        body.style.position = 'fixed'
      }
    }
    this.props.toggleModal()
  }

  render(): React.ReactElement {
    const { offset } = this.state
    const { children, show, opacity } = this.props
    return (
      <SLightbox
        show={show}
        offset={offset}
        opacity={opacity}
        ref={(c: any): void => (this.lightbox = c)}
      >
        <SModalContainer>
          <SCard>
            <SCloseButton size={25} color="black" onClick={this.toggleModal} />
            <SModalContent>{children}</SModalContent>
          </SCard>
        </SModalContainer>
      </SLightbox>
    )
  }
}

export default Modal
