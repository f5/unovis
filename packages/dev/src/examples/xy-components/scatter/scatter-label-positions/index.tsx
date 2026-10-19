import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import { useComponentConfig } from '@src/components/ExampleControls/useComponentConfig'
import React from 'react'
import { VisXYContainer, VisScatter, VisAxis, VisLine } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Point Label Positions'
export const subTitle = 'Toggle label content'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y + 5,
  ]

  const data: XYDataRecord[] = [
    { x: 0, y: 0 },
    { x: 2, y: 1 },
    { x: 3, y: 0.5 },
  ]
  const [showLabels, setShowLabels] = useComponentState('example', 'showLabels', false)
  const { config, reset } = useComponentConfig('scatter', { label: showLabels ? (d: XYDataRecord): string => `${d.y}` : undefined })
  const toggleLabels = (): void => { setShowLabels(!config.label); reset(['label']) }

  return (
    <>
      <ExampleControls components={['example', 'scatter']}/>
      <label>Labels: <input type='checkbox' checked={!!config.label} onChange={toggleLabels}/></label>
      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisScatter
          x={d => d.x}
          y={accessors}
          label={showLabels ? (d) => `${d.y}` : undefined}
          labelPosition='top'
          duration={props.duration}
        />
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </>
  )
}
