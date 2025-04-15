import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateHierarchyData } from '@/utils/data'
import { VisChordDiagram, VisSingleContainer } from '@unovis/react'
import React, { useState } from 'react'

export const title = 'Labels and Radius Scale Exponent'
export const subTitle = 'Select value from range'


const levels = { a: 3, b: 2 }
const data = generateHierarchyData(12, levels)
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [radiusScaleExponent, setRadiusScaleExponent] = useState(2)
  return (
    <div>
      <div>
        <div><code>Radius scale exponent: {radiusScaleExponent}</code></div>
        <input type='range' min={0} max={5} step={0.5} onChange={e => setRadiusScaleExponent(Number(e.target.value))}/>
      </div>
      <VisSingleContainer height={600} data={data}>
        <VisChordDiagram radiusScaleExponent={radiusScaleExponent} nodeLevels={['a', 'b']} duration={props.duration}/>
      </VisSingleContainer>
    </div>
  )
}
