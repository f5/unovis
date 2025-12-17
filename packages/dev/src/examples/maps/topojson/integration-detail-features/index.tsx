import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Colormap, labels and flow animation'
export const subTitle = 'Leaflet map features'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy: number;
  warning: number;
  critical: number;
  shape?: string;
}

type AreaDatum = {
  id: string;
  age: number[];
};


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

// Sample area data with country names for labels
const areaData = [
  { id: 'US', name: 'United States' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'JP', name: 'Japan' },
  { id: 'AU', name: 'Australia' },
  { id: 'FR', name: 'France' },
  { id: 'DE', name: 'Germany' },
  { id: 'EG', name: 'Egypt' },
  { id: 'CN', name: 'China' },
  { id: 'IN', name: 'India' },
  { id: 'BR', name: 'Brazil' },
  { id: 'CA', name: 'Canada' },
  { id: 'RU', name: 'Russia' },
]

// Generate more data points for better clustering demonstration
export const data: { areas: any[]; points: DataRecord[]; links: FlowDataRecord[] } = {
  areas: areaData,
  points: [
    // New York area cluster
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, healthy: 80, warning: 15, critical: 5, shape: 'circle' },
    { id: 'Newark', latitude: 40.7357, longitude: -74.1724, healthy: 75, warning: 20, critical: 5, shape: 'circle' },
    { id: 'Jersey City', latitude: 40.7282, longitude: -74.0776, healthy: 70, warning: 25, critical: 5, shape: 'circle' },

    // Tokyo area cluster
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, healthy: 90, warning: 8, critical: 2, shape: 'triangle' },
    { id: 'Shibuya', latitude: 35.6598, longitude: 139.7006, healthy: 85, warning: 12, critical: 3, shape: 'triangle' },
    { id: 'Shinjuku', latitude: 35.6895, longitude: 139.6917, healthy: 88, warning: 10, critical: 2, shape: 'triangle' },

    // Sydney area cluster
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, healthy: 65, warning: 25, critical: 10, shape: 'square' },
    { id: 'Bondi', latitude: -33.8906, longitude: 151.2767, healthy: 60, warning: 30, critical: 10, shape: 'triangle' },

    // Isolated points
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, healthy: 75, warning: 18, critical: 7, shape: 'square' },
    { id: 'Cairo', latitude: 30.0444, longitude: 31.2357, healthy: 60, warning: 30, critical: 10, shape: 'square' },
  ],
  links: flowData,
}

export const component = (): React.ReactNode => {
  const colorMap = {
    healthy: { color: '#4CAF50', className: 'healthy' },
    warning: { color: '#FF9800', className: 'warning' },
    critical: { color: '#F44336', className: 'critical' },
  }

  return (
    <div>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap<any, DataRecord, FlowDataRecord>
          topojson={WorldMapTopoJSON}
          // Point clustering and styling
          pointRadius={8}
          pointLabel={(d: DataRecord) => d.id}
          pointLabelPosition={'bottom'}
          pointShape={(d: DataRecord) => d.shape}
          pointRingWidth={4}
          clustering={true}
          clusteringDistance={500}
          clusterColor={() => '#2196F3'}
          clusterRadius={10}
          clusterRingWidth={3}
          clusterLabel={(d: any) => {
            const count = d.pointCount || d.point_count || d.properties?.pointCount || d.properties?.point_count
            return count?.toString() || ''
          }}
          clusterExpandOnClick={true}
          areaLabel={(d: AreaDatum) => d?.name}
          areaColor={'#dce3eb'}
          // Flow animation features
          enableFlowAnimation={true}
          sourceLongitude={(d: FlowDataRecord) => d.sourceLongitude}
          sourceLatitude={(d: FlowDataRecord) => d.sourceLatitude}
          targetLongitude={(d: FlowDataRecord) => d.targetLongitude}
          targetLatitude={(d: FlowDataRecord) => d.targetLatitude}

          // Flow styling based on type and volume
          sourcePointRadius={(d: FlowDataRecord) => Math.max(3, Math.sqrt(d.volume / 100) + 2)}
          flowParticleColor={'#607D8B'}
          flowParticleRadius={1}
          flowParticleSpeed={0.2}
          flowParticleDensity={0.5}

          // Link styling
          linkColor={'#607D8B'}
          linkWidth={(d: FlowDataRecord) => Math.max(1, d.volume / 800)}
        />
      </VisSingleContainer>
    </div>
  )
}
