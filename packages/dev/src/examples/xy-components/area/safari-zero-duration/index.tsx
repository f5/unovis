import React, { useState } from 'react'
import { VisXYContainer, VisArea, VisAxis } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import { TsAreaChart, accessors } from './ts-area-chart'

export const title = 'Safari Zero Duration'
export const subTitle = 'Clipped components in Safari, issue #529'

export const component = (props: ExampleViewerDurationProps): React.ReactElement => {
  const [data, setData] = useState(() => generateXYDataRecords(15))
  const [mountKey, setMountKey] = useState(0)

  return (
    <div>
      <p>
        With <code>duration: 0</code> Safari used to skip painting the clipped Area paths on the initial render,
        even though the DOM had the correct geometry, because the container&apos;s <code>&lt;clipPath&gt;</code> came
        after the components in the SVG. Axes are not clipped, so they always rendered fine.
        All three charts should render in Safari.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMountKey(k => k + 1)}>Re-mount charts</button>
        <button onClick={() => setData(generateXYDataRecords(15))}>New data</button>
      </div>
      <div key={mountKey}>
        <h4>@unovis/ts, <code>duration: 0</code> (was blank in Safari)</h4>
        <TsAreaChart data={data} duration={0}/>

        <h4>@unovis/react, <code>duration={'{0}'}</code> (was blank in Safari)</h4>
        <VisXYContainer<XYDataRecord> data={data} height={200}>
          <VisArea x={d => d.x} y={accessors} duration={0}/>
          <VisAxis type='x' duration={0}/>
          <VisAxis type='y' duration={0}/>
        </VisXYContainer>

        <h4>@unovis/ts, <code>duration: {props.duration ?? 'default'}</code> (control)</h4>
        <TsAreaChart data={data} duration={props.duration}/>
      </div>
    </div>
  )
}
