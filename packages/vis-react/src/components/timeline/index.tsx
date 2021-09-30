/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Timeline, TimelineConfigInterface } from '@volterra/vis'
import { Timeline, TimelineConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTimelineProps<Datum> = TimelineConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTimeline<Datum> (props: VisTimelineProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Timeline<Datum>>>(null)
  const [component] = useState<Timeline<Datum>>(new Timeline(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Timeline<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
