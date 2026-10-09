import React from 'react'
import clsx from 'clsx'

// Internal Deps
import type { SupportStatus } from '@site/src/comparisons/features'
import { SUPPORT_STATUS_LABELS } from './constants'

// Styles
import s from './styles.module.css'

export function FeatureStatusLegend (): JSX.Element {
  return (
    <dl className={s.legend}>
      {(Object.keys(SUPPORT_STATUS_LABELS) as SupportStatus[]).map(status => (
        <div key={status} className={clsx(s.legendItem, s[status])}>
          <dt className={s.status}>
            <span className={s.icon} aria-hidden="true">{SUPPORT_STATUS_LABELS[status].icon}</span>
            {SUPPORT_STATUS_LABELS[status].label}
          </dt>
          <dd>{SUPPORT_STATUS_LABELS[status].description}</dd>
        </div>
      ))}
    </dl>
  )
}
