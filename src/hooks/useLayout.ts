import { useEffect, useState, useMemo } from 'react'

import { STYLE } from 'consts'

const useLayout = (): {
  isDesktopWidth: boolean
  isUnderTabletWidth: boolean
  isUnderMobileWidth: boolean
} => {
  const [isUnderMobileWidth, setIsUnderMobileWidth] = useState<boolean>(
    window.innerWidth < STYLE.MOBILE
  )
  const [isUnderTabletWidth, setIsUnderTabletWidth] = useState<boolean>(
    window.innerWidth < STYLE.TABLET
  )

  const isDesktopWidth = useMemo(() => {
    return false === isUnderTabletWidth && false === isUnderMobileWidth
  }, [isUnderTabletWidth, isUnderMobileWidth])

  const updateSize = (): void => {
    setIsUnderMobileWidth(window.innerWidth < STYLE.MOBILE)
    setIsUnderTabletWidth(window.innerWidth < STYLE.TABLET)
  }

  useEffect(() => {
    window.addEventListener('resize', updateSize)
    updateSize()

    return (): void => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return {
    isUnderTabletWidth,
    isUnderMobileWidth,
    isDesktopWidth,
  }
}

export default useLayout
