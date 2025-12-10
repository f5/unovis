import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Clustered Color Map with Flow Animation'
export const subTitle = 'Points with clustering, pie chart visualization, and animated data flows'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy: number;
  warning: number;
  critical: number;
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
    id: 'LON-TOK',
    source: 'London DC',
    target: 'Tokyo DC',
    sourceLongitude: -0.1278,
    sourceLatitude: 51.5074,
    targetLongitude: 139.6503,
    targetLatitude: 35.6762,
    volume: 800,
    type: 'sync',
  },
  {
    id: 'TOK-SYD',
    source: 'Tokyo DC',
    target: 'Sydney DC',
    sourceLongitude: 139.6503,
    sourceLatitude: 35.6762,
    targetLongitude: 151.2093,
    targetLatitude: -33.8688,
    volume: 600,
    type: 'backup',
  },

]

// Generate more data points for better clustering demonstration
export const data: { points: DataRecord[]; links: FlowDataRecord[] } = {
  points: [
    // New York area cluster
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, healthy: 80, warning: 15, critical: 5, shape: 'circle' },
    { id: 'Newark', latitude: 40.7357, longitude: -74.1724, healthy: 75, warning: 20, critical: 5, shape: 'circle' },
    { id: 'Jersey City', latitude: 40.7282, longitude: -74.0776, healthy: 70, warning: 25, critical: 5, shape: 'circle' },

    // London area cluster
    { id: 'London', latitude: 51.5074, longitude: -0.1278, healthy: 70, warning: 20, critical: 10, shape: 'ring' },
    { id: 'Westminster', latitude: 51.4994, longitude: -0.1269, healthy: 65, warning: 25, critical: 10, shape: 'ring' },
    { id: 'Camden', latitude: 51.5290, longitude: -0.1255, healthy: 72, warning: 18, critical: 10, shape: 'ring' },

    // Tokyo area cluster
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, healthy: 90, warning: 8, critical: 2, shape: 'square' },
    { id: 'Shibuya', latitude: 35.6598, longitude: 139.7006, healthy: 85, warning: 12, critical: 3, shape: 'square' },
    { id: 'Shinjuku', latitude: 35.6895, longitude: 139.6917, healthy: 88, warning: 10, critical: 2, shape: 'square' },

    // Sydney area cluster
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, healthy: 65, warning: 25, critical: 10, shape: 'triangle' },
    { id: 'Bondi', latitude: -33.8906, longitude: 151.2767, healthy: 60, warning: 30, critical: 10, shape: 'triangle' },

    // Isolated points
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, healthy: 75, warning: 18, critical: 7, shape: 'circle' },
    { id: 'Berlin', latitude: 52.5200, longitude: 13.4050, healthy: 82, warning: 15, critical: 3, shape: 'circle' },
    { id: 'Cairo', latitude: 30.0444, longitude: 31.2357, healthy: 60, warning: 30, critical: 10, shape: 'triangle' },
  ],
  links: flowData,
}

export const component = (): React.ReactNode => {
  const [enableFlows, setEnableFlows] = React.useState(true)
  const [flowSpeed, setFlowSpeed] = React.useState(0.08)

  const colorMap = {
    healthy: { color: '#4CAF50', className: 'healthy' },
    warning: { color: '#FF9800', className: 'warning' },
    critical: { color: '#F44336', className: 'critical' },
  }

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

          // Point clustering and styling
          // pointRadius={10}
          // pointLabel={d => d.id}
          // pointShape={d => d.shape}
          // pointRingWidth={4}
          clustering={true}
          clusteringDistance={100}
          clusterColor={() => '#2196F3'}
          clusterRadius={10}
          clusterRingWidth={3}
          clusterExpandOnClick={true}
          colorMap={colorMap}

          // Flow animation features
          enableFlowAnimation={enableFlows}
          sourceLongitude={(d: FlowDataRecord) => d.sourceLongitude}
          sourceLatitude={(d: FlowDataRecord) => d.sourceLatitude}
          targetLongitude={(d: FlowDataRecord) => d.targetLongitude}
          targetLatitude={(d: FlowDataRecord) => d.targetLatitude}

          // Flow styling based on type and volume
          // sourcePointRadius={(d: FlowDataRecord) => Math.max(3, Math.sqrt(d.volume / 100) + 2)}
          // sourcePointColor={'#607D8B'}
          flowParticleColor={'#607D8B'}
          flowParticleRadius={(d: FlowDataRecord) => Math.max(1, d.volume / 600) + 0.5}
          flowParticleSpeed={flowSpeed}
          flowParticleDensity={(d: FlowDataRecord) => Math.max(0.3, Math.min(1.0, d.volume / 1000))}

          // Link styling
          linkColor={'#607D8B'}
          linkWidth={(d: FlowDataRecord) => Math.max(1, d.volume / 800)}
        />
      </VisSingleContainer>
    </div>
  )
}
