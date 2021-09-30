/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { StackedBar, StackedBarConfigInterface } from '@volterra/vis'
import { StackedBar, StackedBarConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisStackedBarProps<Datum> = StackedBarConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisStackedBar<Datum> (props: VisStackedBarProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<StackedBar<Datum>>>(null)
  const [component] = useState<StackedBar<Datum>>(new StackedBar(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<StackedBar<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
