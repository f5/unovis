/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Brush, BrushConfigInterface } from '@volterra/vis'
import { Brush, BrushConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisBrushProps<Datum = GenericDataRecord> = BrushConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisBrush<Datum = GenericDataRecord> (props: VisBrushProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Brush<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Brush<Datum>>(new Brush(props))

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
