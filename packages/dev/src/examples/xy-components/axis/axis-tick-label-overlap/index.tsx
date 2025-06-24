import React, { useState, useEffect } from 'react'
import { VisXYContainer, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { Scale } from '@unovis/ts'

export const title = 'Axis Tick Label Overlap'
export const subTitle = 'Resolving overlapping labels'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  // Define different domain configurations to cycle through
  const domainConfigs: [number, number][][] = [
    [[0, 1000], [0, 10000000], [0, 10000000], [0, Date.now()]],
    [[0, 5000], [0, 50000000], [0, 50000000], [Date.now() - 86400000, Date.now()]],
    [[0, 500], [0, 1000000], [0, 1000000], [Date.now() - 604800000, Date.now()]],
    [[0, 10000], [0, 100000000], [0, 100000000], [Date.now() - 2592000000, Date.now()]],
  ]

  const [currentConfigIndex, setCurrentConfigIndex] = useState(0)
  const currentConfig = domainConfigs[currentConfigIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConfigIndex((prevIndex) => (prevIndex + 1) % domainConfigs.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [domainConfigs.length])

  return (<>
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
