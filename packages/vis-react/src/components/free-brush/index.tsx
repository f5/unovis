/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { FreeBrush, FreeBrushConfigInterface } from '@volterra/vis'
import { FreeBrush, FreeBrushConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisFreeBrushProps<Datum = GenericDataRecord> = FreeBrushConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisFreeBrush<Datum = GenericDataRecord> (props: VisFreeBrushProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: FreeBrush<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<FreeBrush<Datum>>(new FreeBrush(props))

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
