import React from 'react'

import { useFps } from '@src/utils/use-fps'

// Styles
import s from './style.module.css'

/** Kept as its own component so that the reading, which updates several times a second,
 * only re-renders itself */
export function FpsMeter (): React.ReactNode {
  const fps = useFps()

  return (
    <span
      className={s.fpsMeter}
      title='Frames per second'
      data-level={fps >= 50 ? 'good' : fps >= 25 ? 'fair' : 'poor'}
    >
      {fps} fps
    </span>
  )
}
