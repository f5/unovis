import React, { useState, useEffect } from 'react'
import { getCurrentTime } from '@src/utils/data'
import { VisXYContainer, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { usePlayback, PlaybackControl } from '@src/components/PlaybackControl'
import { Scale } from '@unovis/ts'

export const title = 'Axis Tick Label Overlap'
export const subTitle = 'Resolving overlapping labels'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [playing, setPlaying] = usePlayback()
  // Define different domain configurations to cycle through
  const domainConfigs: [number, number][][] = [
    [[0, 1000], [0, 10000000], [0, 10000000], [0, getCurrentTime()]],
    [[0, 5000], [0, 50000000], [0, 50000000], [getCurrentTime() - 86400000, getCurrentTime()]],
    [[0, 500], [0, 1000000], [0, 1000000], [getCurrentTime() - 604800000, getCurrentTime()]],
    [[0, 10000], [0, 100000000], [0, 100000000], [getCurrentTime() - 2592000000, getCurrentTime()]],
  ]

  const [currentConfigIndex, setCurrentConfigIndex] = useState(0)
  const currentConfig = domainConfigs[currentConfigIndex]

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setCurrentConfigIndex((prevIndex) => (prevIndex + 1) % domainConfigs.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [domainConfigs.length, playing])

  return (<>
    <PlaybackControl playing={playing} onPlayingChange={setPlaying}/>
    <VisXYContainer xDomain={currentConfig[0]} height={75}>
      <VisAxis type='x' numTicks={25} duration={props.duration} tickTextHideOverlapping={true}/>
    </VisXYContainer>
    <VisXYContainer xDomain={currentConfig[1]} height={75}>
      <VisAxis type='x' numTicks={25} duration={props.duration} tickTextHideOverlapping={true}/>
    </VisXYContainer>
    <VisXYContainer xDomain={currentConfig[2]} height={75}>
      <VisAxis type='x' numTicks={25} duration={props.duration} tickTextHideOverlapping={true} tickTextAngle={15}/>
    </VisXYContainer>
    <VisXYContainer xDomain={currentConfig[3]} height={125} xScale={Scale.scaleTime()}>
      <VisAxis type='x' numTicks={7} duration={props.duration} tickTextHideOverlapping={true}/>
    </VisXYContainer>
  </>)
}
