import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Flow Animation'
export const subTitle = 'Points with animated data flows'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy?: number;
  warning?: number;
  critical?: number;
  shape?: string;
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
    id: 'London',
    source: 'London',
    target: 'Tokyo',
    sourceLongitude: -0.1278,
    sourceLatitude: 51.5074,
    targetLongitude: 139.6503,
    targetLatitude: 35.6762,
    volume: 800,
    type: 'sync',
  },
  {
    id: 'Tokyo',
    source: 'Tokyo',
    target: 'Sydney',
    sourceLongitude: 139.6503,
    sourceLatitude: 35.6762,
    targetLongitude: 151.2093,
    targetLatitude: -33.8688,
    volume: 600,
    type: 'backup',
  },

]

// Generate more data points for better clustering demonstration
export const data: { points: DataRecord[]; links?: FlowDataRecord[] } = {
  points: [
    { id: 'London', latitude: 51.5074, longitude: -0.1278 },
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  ],
  links: flowData,
}

export const component = (): React.ReactNode => {
  const [enableFlows, setEnableFlows] = React.useState(true)
  const [enableLinks, setEnableLinks] = React.useState(true)
  const [flowSpeed, setFlowSpeed] = React.useState(0.08)

  return (
    <div>
      {/* Controls */}
      <div style={{
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: '8px',
        margin: '16px 0',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={enableFlows}
            onChange={(e) => setEnableFlows(e.target.checked)}
          />
          Enable Flow Animation
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={enableLinks}
            onChange={(e) => setEnableLinks(e.target.checked)}
          />
          Enable Link
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Flow Speed:
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={flowSpeed}
            onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
            style={{ width: '120px' }}
          />
          {flowSpeed.toFixed(2)}
        </label>
      </div>

      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap<any, DataRecord, FlowDataRecord>
          topojson={WorldMapTopoJSON}
          enableFlowAnimation={enableFlows}
          mapFitToPoints={true}
          flowParticleColor={'#54bf31'}
          flowParticleSpeed={flowSpeed}
          flowParticleRadius={3}
          linkColor={'#607D8B'}
          linkWidth={enableLinks ? 4 : 0}
          duration={0}
          sourcePointRadius={4}
        />
      </VisSingleContainer>
    </div>
  )
}
