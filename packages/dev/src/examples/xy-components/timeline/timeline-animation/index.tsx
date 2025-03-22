import React, { useEffect } from 'react'
import { VisXYContainer, VisTimeline } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { TextAlign } from '@unovis/ts'

export const title = 'Animation Tweaking'
export const subTitle = 'Control enter/exit position'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [shouldRenderData, setShouldRenderData] = React.useState(true)
  const intervalIdRef = React.useRef<NodeJS.Timeout | null>(null)
  const data = Array(10).fill(0).map((_, i) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    length: 1000 * 60 * 60 * 24,
    id: i.toString(),
    type: `Row ${i}`,
    lineWidth: 5 + Math.random() * 15,
  }))

  type Datum = typeof data[number]

  useEffect(() => {
    clearInterval(intervalIdRef.current!)
    intervalIdRef.current = setInterval(() => {
      setShouldRenderData(should => !should)
    }, 2000)
  }, [])

  return (<>
    <VisXYContainer<Datum>
      data={shouldRenderData ? data : []}
      height={300}
      duration={1500}
    >
      <VisTimeline
        id={(d) => d.id}
        lineRow={(d: Datum) => d.type as string}
        x={(d: Datum) => d.timestamp}
        rowHeight={undefined}
        lineWidth={(d) => d.lineWidth}
        lineCap
        showEmptySegments
        showRowLabels
        rowLabelTextAlign={TextAlign.Left}
        duration={props.duration}
        animationLineEnterPosition={[undefined, -110]}
        animationLineExitPosition={[1000, undefined]}
      />
    </VisXYContainer>
  </>
  )
}
