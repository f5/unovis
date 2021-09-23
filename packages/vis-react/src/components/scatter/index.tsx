/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Scatter, ScatterConfigInterface } from '@volterra/vis'
import { Scatter, ScatterConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisScatterProps<Datum = GenericDataRecord> = ScatterConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisScatter<Datum = GenericDataRecord> (props: VisScatterProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Scatter<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Scatter<Datum>>(new Scatter(props))

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
