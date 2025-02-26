import React from 'react'
import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair, VisStackedBar, VisScatter } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Scale by Domain'
export const subTitle = 'XY component comparison'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = Array.from({ length: 10 }, (_, i) => ({
    x: i + 1,
    y: Math.pow(2, i + 1),
  }))
  const configs = [
    { },
    { scaleByDomain: true },
    { scaleByDomain: true, xDomain: [1, 5] },
  ]
  const components = [VisArea, VisLine, VisStackedBar, VisScatter]
  return (<>
    {components.map(// eslint-disable-next-line @typescript-eslint/naming-convention
      Component => (
        <div style={{ display: 'flex', width: '100%', height: 200 }}>
          {configs.map((c, i) => (
            <VisXYContainer key={`c${i}`} {...c}>
              <Component data={data} x={d => d.x} y={d => d.y} duration={props.duration}/>
              <VisCrosshair/>
              <VisAxis type="x" minMaxTicksOnly duration={props.duration}/>
              <VisAxis type="y" minMaxTicksOnly duration={props.duration}/>
            </VisXYContainer>
          ))}
        </div>
      ))}
  </>)
}
