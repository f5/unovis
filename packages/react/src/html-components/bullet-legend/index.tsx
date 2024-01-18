import React, { useEffect, useRef, useState } from 'react'
import { BulletLegend, BulletLegendConfigInterface } from '@unovis/ts'

export type VisBulletLegendProps = BulletLegendConfigInterface

export const VisBulletLegendSelectors = BulletLegend.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisBulletLegend (props: VisBulletLegendProps): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<BulletLegend>()

  // On Mount
  useEffect(() => {
    const c = new BulletLegend(container.current as HTMLDivElement, props)
    setComponent(c)

    return () => c?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    component?.update(props)
  })

  return <div ref={container} />
}
