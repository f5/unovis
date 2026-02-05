import React, { useEffect, useState } from 'react'
import { VisSingleContainer, VisTooltip, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import { TopoJSONMap } from '@unovis/ts'
import s from './style.module.css'
export const title = 'Point Shapes'
export const subTitle = 'Points with different shapes based on data field'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  shape?: string;
  pointColor?: string;
}

export const data: { points: DataRecord[] } = {
  points: [
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, shape: 'circle', pointColor: '#ff7f0e' },
    { id: 'London', latitude: 51.5074, longitude: -0.1278, shape: 'ring', pointColor: '#ff7f0e' },
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, shape: 'square', pointColor: '#ff7f0e' },
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, shape: 'triangle', pointColor: '#ff7f0e' },
  ],
}

export const component = (): React.ReactNode => {
  const [ringWidth, setRingWidth] = useState(10)

  useEffect(() => {
    let toggle = false
    const interval = setInterval(() => {
      toggle = !toggle
      setRingWidth(toggle ? 30 : 10)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={s.map}>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap<any, DataRecord, any>
          topojson={WorldMapTopoJSON}
          pointRingWidth={ringWidth}
          pointBottomLabel={d => d.id}
          pointShape={d => d.shape}
          pointColor={d => d.pointColor}
          duration={500}
        />
        <VisTooltip triggers={{
          [TopoJSONMap.selectors.point]: (d: DataRecord) => {
            return `<strong>${d.id}</strong><br/>Shape: ${d.shape || 'circle'}`
          },
        }} />
      </VisSingleContainer>
    </div>
  )
}
