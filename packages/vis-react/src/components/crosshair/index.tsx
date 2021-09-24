/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Crosshair, CrosshairConfigInterface } from '@volterra/vis'
import { Crosshair, CrosshairConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisCrosshairProps<Datum = GenericDataRecord> = CrosshairConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisCrosshair<Datum = GenericDataRecord> (props: VisCrosshairProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Crosshair<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Crosshair<Datum>>(new Crosshair(props))

  // On Mount
  useEffect(() => {
    (ref.current as RefType).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
