/* eslint-disable notice/notice */
import React, { useEffect, useRef, useState } from 'react'
import { BulletLegend, BulletLegendConfigInterface } from '@volterra/vis'

export type VisBulletLegendProps = BulletLegendConfigInterface

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisBulletLegend (props: VisBulletLegendProps): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<BulletLegend>()

  // On Mount
  useEffect(() => {
    setComponent(
      new BulletLegend(container.current as HTMLDivElement, props)
    )

    return () => component?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    component?.update(props)
  })

  return <div ref={container} />
}

export const VisBulletLegendSelectors = BulletLegend.selectors
