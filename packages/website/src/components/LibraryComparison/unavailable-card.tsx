import React from 'react'
import Link from '@docusaurus/Link'

// Internal Deps
import type { UnsupportedImplementation } from '@site/src/comparisons/types'
import { libraries } from '@site/src/comparisons/libraries'

// Styles
import s from './styles.module.css'

export type UnavailableCardProps = {
  item: UnsupportedImplementation;
  height: number;
}

export function UnavailableCard ({ item, height }: UnavailableCardProps): JSX.Element {
  const library = libraries[item.library]

  return (
    <article className={s.card}>
      <header className={s.cardHeader}>
        <a className={s.libraryName} href={library.website} target="_blank" rel="noopener noreferrer">{library.name}</a>
        <span className={s.badge}>v{library.version}</span>
      </header>
      <div className={s.unavailable} style={{ height }}>
        <div className={s.unavailableTitle}>{item.paid ? 'Only in the paid edition' : 'Not available'}</div>
        <p className={s.unavailableReason}>{item.reason}</p>
        {item.url && <Link to={item.url}>Source</Link>}
      </div>
    </article>
  )
}
