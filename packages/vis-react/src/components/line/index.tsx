/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Line, LineConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisLineProps<Datum> = LineConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisLineFC<Datum> (props: VisLineProps<Datum>): JSX.Element {
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
const memoizedComponent = React.memo(VisLineFC, arePropsEqual)
export const VisLine = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Line.selectors>
VisLine.selectors = Line.selectors
