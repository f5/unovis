import React, { lazy, Suspense } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'

// Internal Deps
import { BUILD_SIZE_CHART_HEIGHT } from './constants'

// Styles
import s from './styles.module.css'

// eslint-disable-next-line @typescript-eslint/naming-convention
const Bars = lazy(() => import('./bars').then(m => ({ default: m.BuildSizeBars })))

export function BuildSizeChart (): JSX.Element {
  const placeholder = <div style={{ height: BUILD_SIZE_CHART_HEIGHT }}/>
  return (
    <div className={s.root}>
      <BrowserOnly fallback={placeholder}>
        {() => (
          <Suspense fallback={placeholder}>
            <Bars/>
          </Suspense>
        )}
      </BrowserOnly>
    </div>
  )
}
