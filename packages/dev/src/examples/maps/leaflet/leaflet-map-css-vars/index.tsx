import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import React, { useLayoutEffect, useRef } from 'react'
import { VisLeafletMap, VisLeafletMapRef } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Data
import cities from '../leaflet-map-vector/cities.json'
import { mapKey } from '../constants'

// Style
import s from './style.module.css'

export const title = 'Light and Dark Theme'
export const subTitle = 'CSS Variables Configuration'


type MapPointDatum = typeof cities[0]
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const mapRef = useRef<VisLeafletMapRef<MapPointDatum> | null>(null)

  const [darkTheme, setDarkTheme] = useComponentState('example', 'darkTheme', document.documentElement.classList.contains('dark-theme'))
  useLayoutEffect(() => {
    if (document.documentElement.classList.contains('dark-theme') !== darkTheme) document.documentElement.classList.toggle('dark-theme', darkTheme)
  }, [darkTheme])

  return (<>
    <div className={s.map}>
      <div className={s.toggleButton}>
        <ExampleControls components={['example']}/>
        <button onClick={() => setDarkTheme(value => !value)}>
        Toggle documentElement
        </button>
      </div>
      <VisLeafletMap<MapPointDatum>
        ref={mapRef}
        data={cities}
        pointColor={(d: MapPointDatum) => d.longitude > 0 ? '#3556FF' : null}
        pointLabel={'✸'}
        pointRadius={12}
        pointLabelColor={(d: MapPointDatum) => d.id === 'USNYC' ? '#3556FF' : null}
        clusterLabelColor={'#ff62cd'}
        clusterRadius={10}
        clusteringDistance={100}
        pointBottomLabel={(d: MapPointDatum) => d.city}
        clusterBottomLabel={c => `${c.point_count} cities`}
        duration={props.duration}
        flyToDuration={props.duration}
        zoomDuration={props.duration}
        style={`https://api.maptiler.com/maps/basic-v2-light/style.json?key=${mapKey}`}
        styleDarkTheme={`https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${mapKey}`}
      />
    </div>
  </>)
}
