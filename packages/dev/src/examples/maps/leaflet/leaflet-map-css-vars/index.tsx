import React, { useEffect, useRef, useState } from 'react'
import { VisLeafletMap, VisLeafletMapRef } from '@unovis/react'

// Data
import cities from '../leaflet-map-vector/cities.json'

// Style
import s from './style.module.css'

export const title = 'Light and Dark Theme'
export const subTitle = 'CSS Variables Configuration'


type MapPointDatum = typeof cities[0]
export const component = (): JSX.Element => {
  const mapKey = 'LNln6dGJDxyBa7F3c7Gd'
  const mapRef = useRef<VisLeafletMapRef<MapPointDatum> | null>(null)
  const [isDarkTheme, toggleTheme] = useState(false)

  useEffect(() => {
    return () => document.body.classList.remove('theme-dark')
  }, [])

  const handleClick = (): void => {
    toggleTheme(!isDarkTheme)
    document.body.classList.toggle('theme-dark')
  }

  return (<>
    <button className={s.toggleThemeButton} onClick={handleClick}>{isDarkTheme ? 'Light' : 'Dark'} Theme</button>
    <div className={s.map}>
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
        style={`https://api.maptiler.com/maps/basic-v2-light/style.json?key=${mapKey}`}
        styleDarkTheme={`https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${mapKey}`}
      />
    </div>
  </>)
}
