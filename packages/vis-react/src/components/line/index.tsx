/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Line, LineConfigInterface } from '@volterra/vis'
import { Line, LineConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisLineProps<Datum> = LineConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisLine<Datum> (props: VisLineProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Line<Datum>>>(null)
  const [component] = useState<Line<Datum>>(new Line(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Line<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
