// Copyright (c) Volterra, Inc. All rights reserved.
import { useState } from 'react'
import { VisXYContainer } from '../src/containers/xy-container'
import { VisArea } from '../src/components/area'

type DataRecord = {
  x: number;
  y: number;
}

const generateSampleData = (n = 100): DataRecord[] => Array(n).fill(0).map((_, i) => ({ x: i, y: i * 10 * Math.sin(i / 10) }))

export const SampleComponent = (props: Record<string, unknown>): JSX.Element => {
  const [data, setData] = useState(generateSampleData(10))

  setInterval(() => {
    setData(generateSampleData(Math.floor(Math.random() * 100)))
  }, 3000)

  return (<div style={{}}>
    <VisXYContainer data={data}>
      <VisArea x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y}/>
      <VisArea x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y * 0.5} color="yellow" />
      <VisArea x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y * 0.3} color="green" />
    </VisXYContainer>
  </div>)
}
