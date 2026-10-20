import React, { useCallback, useEffect, useState } from 'react'
import { usePlayback } from '@src/components/PlaybackControl'

// Styles
import s from './style.module.css'

export type TransitionComponentProps<T> = {
  component: React.FC<{ data: T }>;
  data: () => T;
  dataSeries: Record<string, (d: T) => T>;
}

export function TransitionComponent<T> (props: TransitionComponentProps<T>): React.ReactNode {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { data: generateData, dataSeries, component: Component } = props

  const [data, setData] = useState<T>(generateData)
  const [playing, setPlaying] = usePlayback()
  const paused = !playing
  const [usingDefaultData, setUsingDefaultData] = useState<boolean>(true)

  const resetData = useCallback(() => {
    setData(generateData())
    setUsingDefaultData(true)
  }, [usingDefaultData])

  const toggleState = useCallback(() => {
    setUsingDefaultData(!usingDefaultData)
  }, [usingDefaultData])

  useEffect(() => {
    if (!paused) toggleState()
  }, [paused])

  useEffect(() => {
    if (!paused) {
      const timer = setTimeout(toggleState, 2000)
      return () => clearTimeout(timer)
    }
  }, [usingDefaultData, paused])

  return (<>
    <div className='controller'>
      <button type='button' onClick={resetData} aria-label='Reset data'><i className='fa fa-rotate-right' aria-hidden /></button>
      <button type='button' onClick={() => setPlaying(!playing)} aria-label={paused ? 'Resume updates' : 'Pause updates'} aria-pressed={paused}
        data-dev-variant={paused ? 'primary' : undefined}>
        <i className={`fa fa-${paused ? 'play' : 'pause'}`} aria-hidden />
      </button>
    </div>
    {Object.keys(dataSeries).map((key) => (
      <div key={key}>
        <p className='label'>
          <span className={usingDefaultData ? s.inactive : ''}>Default</span>
          <span className='fa fa-arrows-left-right'></span>
          <span className={!usingDefaultData ? s.inactive : ''}>{
            key.replace(/([A-Z])/g, ' $1').replace(/^./, (match) => match.toUpperCase())
          }</span>
        </p>
        <Component data={usingDefaultData ? data : dataSeries[key](data)}/>
      </div>
    ))}
  </>
  )
}
