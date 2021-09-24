/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Timeline, TimelineConfigInterface } from '@volterra/vis'
import { Timeline, TimelineConfigInterface, GenericDataRecord } from '@volterra/vis'

export type VisTimelineProps<Datum = GenericDataRecord> = TimelineConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTimeline<Datum = GenericDataRecord> (props: VisTimelineProps<Datum>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Timeline<Datum> }
  const ref = useRef<RefType>(null)
  const [component] = useState<Timeline<Datum>>(new Timeline(props))

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
