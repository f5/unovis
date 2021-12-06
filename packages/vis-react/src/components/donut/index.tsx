/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Donut, DonutConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisDonutProps<Datum> = DonutConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisDonutFC<Datum> (props: VisDonutProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Donut<Datum>>>(null)
  const [component] = useState<Donut<Datum>>(new Donut(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Donut<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
const memoizedComponent = React.memo(VisDonutFC, arePropsEqual)
export const VisDonut = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Donut.selectors>
VisDonut.selectors = Donut.selectors
