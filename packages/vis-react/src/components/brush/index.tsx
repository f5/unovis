/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Brush, BrushConfigInterface } from '@volterra/vis'
import { Brush, BrushConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisBrushProps<Datum> = BrushConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisBrush<Datum> (props: VisBrushProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Brush<Datum>>>(null)
  const [component] = useState<Brush<Datum>>(new Brush(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Brush<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
