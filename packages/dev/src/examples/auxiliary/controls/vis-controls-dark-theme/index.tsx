import React, { useEffect, useRef } from 'react'
import { VisControls } from '@unovis/ts'

export const title = 'Controls'
export const subTitle = 'Theme border color'

export const component = (): React.ReactNode => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return undefined
    const controls = new VisControls(containerRef.current, {
      items: [
        { icon: '+' },
        { icon: '&minus;', borderLeft: true },
        { icon: '&#x21bb;', borderLeft: true },
      ],
    })
    return () => { controls.element.remove() }
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <p>Border respects the active theme</p>
      <div ref={containerRef} />
    </div>
  )
}
