import React, { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isFunction } from '@unovis/ts'
import { getCaptureSettings } from '@src/capture/settings'
import { updateExampleSearchParams } from '../ExampleControls/updateSearchParams'

export function getInitialPlaying (initialPlaying = true): boolean {
  const query = window.location.hash.startsWith('#/') ? window.location.hash.split('?')[1] : window.location.search
  const paused = new URLSearchParams(query).get('paused')
  return paused === '1' ? false : paused === '0' ? true : getCaptureSettings() ? false : initialPlaying
}

export function usePlayback (initialPlaying = true): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [, setSearchParams] = useSearchParams()
  const playing = getInitialPlaying(initialPlaying)
  const current = useRef({ playing, setSearchParams })
  current.current = { playing, setSearchParams }
  const setPlaying = useCallback((update: React.SetStateAction<boolean>): void => {
    const value = isFunction(update) ? update(current.current.playing) : update
    current.current.playing = value
    updateExampleSearchParams(current.current.setSearchParams, params => { params.set('paused', value ? '0' : '1') })
  }, [])
  return [playing, setPlaying]
}

export function PlaybackControl ({ playing, onPlayingChange }: { playing: boolean; onPlayingChange: (playing: boolean) => void }): React.ReactElement {
  return <button type="button" onClick={() => onPlayingChange(!playing)}>{playing ? 'Pause updates' : 'Resume updates'}</button>
}
