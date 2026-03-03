import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import s from './style.module.css'

export const title = 'Combined feature of topoJSON map'
export const subTitle = 'Point, flow animation'

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

export type FlowDataRecord = {
  id: string;
  source: string;
  target: string;
  sourceLongitude: number;
  sourceLatitude: number;
  targetLongitude: number;
  targetLatitude: number;
  volume: number;
  type: 'data_transfer' | 'backup' | 'sync';
}

// Generate flow data between major data centers
export const flowData: FlowDataRecord[] = [
  {
    id: 'Boydton',
    source: 'Boydton',
    target: 'SanJose',
    sourceLongitude: -78.3875,
    sourceLatitude: 36.6682,
    targetLongitude: -121.8863,
    targetLatitude: 37.3382,
    volume: 800,
    type: 'sync',
  },
  {
    id: 'Boydton',
    source: 'Boydton',
    target: 'Paris',
    sourceLongitude: -78.3875,
    sourceLatitude: 36.6682,
    targetLongitude: 2.3522,
    targetLatitude: 48.8566,
    volume: 600,
    type: 'backup',
  },

]

// Generate more data points for better clustering demonstration
export const data: { points: DataRecord[]; links?: FlowDataRecord[] } = {
  points: [
    { id: 'San Jose Metric with Long Label', latitude: 37.3382, longitude: -121.8863, shape: 'ring', pointColor: '#ff0000', className: 'point-1' },
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, shape: 'ring', pointColor: '#ff0000', className: 'point-2' },
  ],
  links: flowData,
}

export const component = (): React.ReactNode => {
  return (
    <div className={s.cmap}>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap<any, DataRecord, FlowDataRecord>
          topojson={WorldMapTopoJSON}
          flowParticleSpeed={0.08}
          enableFlowAnimation={true}
          flowParticleRadius={1}
          linkColor={'#607D8B'}
          linkWidth={0}
          duration={0}
          flowParticleDensity={0.4}
          pointRingWidth={10}
          pointBottomLabel={d => d.id}
          pointShape={d => d.shape}
          pointColor={d => d.pointColor}
          pointRadius={6}
        />
      </VisSingleContainer>
    </div>
  )
}
