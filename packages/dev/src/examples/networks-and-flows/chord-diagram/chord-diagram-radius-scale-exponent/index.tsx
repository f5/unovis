import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import React from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { generateHierarchyData } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Labels and Radius Scale Exponent'
export const subTitle = 'Select value from range'


const levels = { a: 3, b: 2 }
const data = generateHierarchyData(12, levels)
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [radiusScaleExponent, setRadiusScaleExponent] = useComponentState('chordDiagram', 'radiusScaleExponent', 2)
  return (
    <div>
      <ExampleControls components={['chordDiagram']}/>
      <div>
        <div><code>Radius scale exponent: {radiusScaleExponent}</code></div>
        <input type='range' value={radiusScaleExponent}
          min={Math.min(0, radiusScaleExponent ?? 0)}
          max={Math.max(5, radiusScaleExponent ?? 5)}
          step={Number.isInteger((radiusScaleExponent ?? 0) / 0.5) ? 0.5 : 'any'}
          onChange={e => setRadiusScaleExponent(Number(e.target.value))}/>
      </div>
      <VisSingleContainer height={600} data={data}>
        <VisChordDiagram radiusScaleExponent={radiusScaleExponent} nodeLevels={['a', 'b']} duration={props.duration}/>
      </VisSingleContainer>
    </div>
  )
}
