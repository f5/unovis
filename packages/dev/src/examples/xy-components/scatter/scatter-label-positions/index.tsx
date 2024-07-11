import React, { useCallback } from 'react'
import { VisXYContainer, VisScatter, VisAxis, VisLine } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'

export const title = 'Point Label Positions'
export const subTitle = 'Toggle label content'

export const component = (): JSX.Element => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y + 5,
  ]

  const data: XYDataRecord[] = [
    { x: 0, y: 0 },
    { x: 2, y: 1 },
    { x: 3, y: 0.5 },
  ]
  const [showLabels, setShowLabels] = React.useState(false)
  const toggleLabels = useCallback(() => setShowLabels(!showLabels), [showLabels])

  return (
    <>
      <label>Labels: <input type='checkbox' onChange={toggleLabels}/></label>
      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisLine x={d => d.x} y={accessors} />
        <VisScatter
          x={d => d.x}
          y={accessors}
          label={showLabels ? (d) => `${d.y}` : undefined}
          labelPosition='top'
        />
        <VisAxis type='x'/>
        <VisAxis type='y'/>
      </VisXYContainer>
    </>
  )
}
