import React, { useEffect, useMemo } from 'react'
import { randomNumberGenerator, getCurrentTime } from '@src/utils/data'
import { VisXYContainer, VisTimeline } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { usePlayback, PlaybackControl } from '@src/components/PlaybackControl'
import { TextAlign } from '@unovis/ts'

export const title = 'Animation Tweaking'
export const subTitle = 'Control enter/exit position'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [playing, setPlaying] = usePlayback()
  const [shouldRenderData, setShouldRenderData] = React.useState(true)
  const data = useMemo(() => Array(10).fill(0).map((_, i) => ({
    timestamp: getCurrentTime() + i * 1000 * 60 * 60 * 24,
    length: 1000 * 60 * 60 * 24,
    id: i.toString(),
    type: `Row ${i}`,
    lineWidth: 5 + randomNumberGenerator() * 15,
  })), [])

  type Datum = typeof data[number]

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setShouldRenderData(should => !should)
    }, 2000)
    return () => clearInterval(interval)
  }, [playing])

  return (<>
    <PlaybackControl playing={playing} onPlayingChange={setPlaying}/>
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
