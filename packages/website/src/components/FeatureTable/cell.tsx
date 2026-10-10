import React, { ReactNode } from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'

// Internal Deps
import type { SupportCell } from '@site/src/comparisons/features'
import { SUPPORT_STATUS_LABELS } from './constants'

// Styles
import s from './styles.module.css'

/* Renders `backtick` fragments of a note as inline code */
function formatNote (note: string): ReactNode[] {
  return note.split('`').map((part, i) => i % 2 ? <code key={i}>{part}</code> : part)
}

export type FeatureCellProps = {
  /** Undefined while a library hasn't been researched for this feature yet */
  cell?: SupportCell;
  textOnly?: boolean;
  showNote?: boolean;
}

export function FeatureCell ({ cell, textOnly, showNote }: FeatureCellProps): JSX.Element {
  if (!cell) return <td className={s.cell} title="Not researched yet">–</td>
  const { icon, label } = SUPPORT_STATUS_LABELS[cell.status]
  return (
    <td className={clsx(s.cell, !textOnly && s[cell.status])} title={showNote ? undefined : cell.note}>
      {textOnly
        ? <span className={s.value}>{cell.value ?? formatNote(cell.note)}</span>
        : <span className={s.status}><span className={s.icon} aria-hidden="true">{icon}</span>{label}</span>
      }
      {showNote && <span className={s.note}>{formatNote(cell.note)}</span>}
      {cell.url && <Link className={s.source} to={cell.url}>Source</Link>}
    </td>
  )
}
