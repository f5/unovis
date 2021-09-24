/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Donut, DonutConfigInterface } from '@volterra/vis'
import { Donut, DonutConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisDonutProps<Datum = GenericDataRecord> = DonutConfigInterface<Datum> & { data?: any }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisDonut<Datum = GenericDataRecord> (props: VisDonutProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Donut<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Donut<Datum>>(new Donut(props))

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
