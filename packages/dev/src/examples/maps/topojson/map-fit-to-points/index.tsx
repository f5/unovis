import React, { useEffect, useState, useRef } from 'react'
import { VisSingleContainer, VisTopoJSONMap, VisTopoJSONMapRef } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'MapFitToPoints'
export const subTitle = 'Adjust number of points to change view'

export const component = (): React.ReactNode => {
  const points = [
    { id: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
    { id: 'Qormi', latitude: 35.8985, longitude: 14.4705 },
    { id: 'Syracuse', latitude: 37.0755, longitude: 15.2860 },
    { id: 'Tripoli', latitude: 32.8872, longitude: 13.1913 },
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { id: 'London', latitude: 51.5074, longitude: -0.1278 },
    { id: 'Reykjavik', latitude: 64.1265, longitude: -21.8174 },
    { id: 'New York', latitude: 40.7128, longitude: -74.0060 },
  ]
  const [data, setData] = useState<{ points: typeof points[0][] }>({ points: [] })
  const [numPoints, setNumPoints] = useState(5)
  const mapRef = useRef<VisTopoJSONMapRef<any, typeof points[0], any> | null>(null)

  const onZoomIn = (): void => { mapRef.current?.component?.zoomIn(1) }
  const onZoomOut = (): void => { mapRef.current?.component?.zoomOut(1) }
  const onFit = (): void => { mapRef.current?.component?.fitView() }

  useEffect(() => {
    setData({ points: points.slice(0, numPoints) })
  }, [numPoints])

  return (
    <div style={{ position: 'relative' }}>
      <label>
        <input
          type='range'
          step={1}
          min={1}
          max={points.length}
          value={numPoints}
          onChange={e => setNumPoints(Number(e.target.value))}
        />
        {numPoints}
      </label>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap
          ref={mapRef}
          topojson={WorldMapTopoJSON}
          duration={0}
          mapFitToPoints={true}
          zoomExtent={[0.5, 100]}
          pointLabel={d => d.id}
        />
      </VisSingleContainer>
      <div style={{ position: 'absolute', top: 32, right: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onZoomIn}>Zoom In</button>
        <button onClick={onZoomOut}>Zoom Out</button>
        <button onClick={onFit}>Fit View</button>
      </div>
    </div>
  )
}
