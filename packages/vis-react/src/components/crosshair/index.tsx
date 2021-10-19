/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Crosshair, CrosshairConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisCrosshairProps<Datum> = CrosshairConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisCrosshair<Datum> (props: VisCrosshairProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Crosshair<Datum>>>(null)
  const [component] = useState<Crosshair<Datum>>(new Crosshair(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Crosshair<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-crosshair ref={ref} />
}
VisCrosshair.selectors = Crosshair.selectors
