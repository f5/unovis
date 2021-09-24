/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { GroupedBar, GroupedBarConfigInterface } from '@volterra/vis'
import { GroupedBar, GroupedBarConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisGroupedBarProps<Datum = GenericDataRecord> = GroupedBarConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisGroupedBar<Datum = GenericDataRecord> (props: VisGroupedBarProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: GroupedBar<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<GroupedBar<Datum>>(new GroupedBar(props))

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
