/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { StackedBar, StackedBarConfigInterface } from '@volterra/vis'
import { StackedBar, StackedBarConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisStackedBarProps<Datum = GenericDataRecord> = StackedBarConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisStackedBar<Datum = GenericDataRecord> (props: VisStackedBarProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: StackedBar<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<StackedBar<Datum>>(new StackedBar(props))

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
