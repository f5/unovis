import React, { useRef, useState } from 'react'
import { VectorSourceSpecification } from 'maplibre-gl'
import { VisLeafletMap, VisLeafletMapRef } from '@unovis/react'
import { MapLibreArcticDark, MapLibreArcticLight } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Data
import cities from './cities.json'

// Style
import s from './style.module.css'

export const title = 'Vector Map'
export const subTitle = 'Vector rendering with MapLibre'


type MapPointDatum = typeof cities[0]
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const mapRef = useRef<VisLeafletMapRef<MapPointDatum> | null>(null)
  const [isMapVisible, setMapVisible] = useState(true)
  const mapSources = {
    sources: {
      openmaptiles: {
        type: 'vector',
        url: `${UNOVIS_MAP_TILE_SERVER_URL}/data/v3.json`,
      } as VectorSourceSpecification,
    },
    glyphs: `${UNOVIS_MAP_TILE_SERVER_URL}/fonts/{fontstack}/{range}.pbf`,
  }

  const handleClick = (): void => {
    setMapVisible(!isMapVisible)
    if (isMapVisible) mapRef.current?.component?.fitView()
  }

  return (<>
    <button className={s.showHideButton} onClick={handleClick}>{isMapVisible ? 'Hide' : 'Show'} Map</button>
    { isMapVisible ? <VisLeafletMap<MapPointDatum>
      ref={mapRef}
      data={cities}
      pointColor={'#3556FF'}
      pointBottomLabel={d => d.city}
      style={{ ...MapLibreArcticLight, ...mapSources }}
      styleDarkTheme={{ ...MapLibreArcticDark, ...mapSources }}
      duration={props.duration}
      flyToDuration={props.duration}
      zoomDuration={props.duration}
      attribution={[
        '<a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      ]}
    /> : null }
  </>)
}
