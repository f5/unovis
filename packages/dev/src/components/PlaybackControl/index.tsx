import React, { useState } from 'react'
import { getCaptureSettings } from '@src/capture/settings'

export function getInitialPlaying (initialPlaying = true): boolean {
  const query = window.location.hash.startsWith('#/') ? window.location.hash.split('?')[1] : window.location.search
  const paused = new URLSearchParams(query).get('paused')
  return paused === '1' ? false : paused === '0' ? true : getCaptureSettings() ? false : initialPlaying
}

export function usePlayback (initialPlaying = true): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  return useState(() => getInitialPlaying(initialPlaying))
}

export function PlaybackControl ({ playing, onPlayingChange }: { playing: boolean; onPlayingChange: (playing: boolean) => void }): React.ReactElement {
  return <button type="button" onClick={() => onPlayingChange(!playing)}>{playing ? 'Pause updates' : 'Resume updates'}</button>
}
