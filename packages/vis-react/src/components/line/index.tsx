/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Line, LineConfigInterface } from '@volterra/vis'
import { Line, LineConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisLineProps<Datum = GenericDataRecord> = LineConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisLine<Datum = GenericDataRecord> (props: VisLineProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Line<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Line<Datum>>(new Line(props))

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
