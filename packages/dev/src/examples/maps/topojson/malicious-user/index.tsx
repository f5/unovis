import React from 'react'
import { VisSingleContainer, VisTooltip, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import { TopoJSONMap } from '@unovis/ts'
import s from './style.module.css'

export const title = 'Malicious User'
export const subTitle = 'Icon label with animation'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy?: number;
  warning?: number;
  critical?: number;
  shape?: string;
  pointColor?: string;
  className?: string;
}

// Generate more data points for better clustering demonstration
export const data: { points: DataRecord[] } = {
  points: [
    { id: 'San Jose Metric with Long Label', latitude: 37.3382, longitude: -121.8863, shape: 'circle', pointColor: '#ff0000' },
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, shape: 'circle', pointColor: '#277fae' },
  ],
}

export const component = (): React.ReactNode => {
  return (
    <div className={s.mmap}>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap<any, DataRecord, any>
          topojson={WorldMapTopoJSON}
          duration={0}
          pointRingWidth={10}
          pointLabel={'✸'}
          pointShape={d => d.shape}
          pointColor={d => d.pointColor}
          pointRadius={10}
          pointLabelColor={'#fff'}
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
