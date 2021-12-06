/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Scatter, ScatterConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisScatterProps<Datum> = ScatterConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisScatterFC<Datum> (props: VisScatterProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Scatter<Datum>>>(null)
  const [component] = useState<Scatter<Datum>>(new Scatter(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Scatter<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
const memoizedComponent = React.memo(VisScatterFC, arePropsEqual)
export const VisScatter = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Scatter.selectors>
VisScatter.selectors = Scatter.selectors
