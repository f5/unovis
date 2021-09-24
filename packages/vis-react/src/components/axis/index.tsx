/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Axis, AxisConfigInterface } from '@volterra/vis'
import { Axis, AxisConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisAxisProps<Datum = GenericDataRecord> = AxisConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisAxis<Datum = GenericDataRecord> (props: VisAxisProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Axis<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Axis<Datum>>(new Axis(props))

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
