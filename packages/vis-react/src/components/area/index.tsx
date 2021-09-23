/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Area, AreaConfigInterface } from '@volterra/vis'
import { Area, AreaConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisAreaProps<Datum = GenericDataRecord> = AreaConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisArea<Datum = GenericDataRecord> (props: VisAreaProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Area<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Area<Datum>>(new Area(props))

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
