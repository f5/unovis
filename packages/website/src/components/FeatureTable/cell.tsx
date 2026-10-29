import React, { ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import Link from '@docusaurus/Link'

// Internal Deps
import type { SupportCell } from '@site/src/comparisons/features'
import { SUPPORT_STATUS_LABELS, FEATURE_TOOLTIP_OFFSET } from './constants'

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
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>()
  if (!cell) return <td className={s.cell} title="Not researched yet">–</td>
  const { icon, label } = SUPPORT_STATUS_LABELS[cell.status]

  // The table scrolls horizontally, so the tooltip is rendered outside of it to avoid clipping
  const showTooltip = (e: React.SyntheticEvent<HTMLElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - FEATURE_TOOLTIP_OFFSET })
  }
  const hideTooltip = (): void => setTooltipPosition(undefined)

  return (
    <td className={clsx(s.cell, !textOnly && s[cell.status])}>
      {textOnly
        ? <span className={s.value}>{cell.value ?? formatNote(cell.note)}</span>
        : showNote
          ? <span className={s.status}><span className={s.icon} aria-hidden="true">{icon}</span>{label}</span>
          : (
            <span
              className={clsx(s.status, s.iconOnly)}
              tabIndex={0}
              aria-label={`${label}. ${cell.note}`}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onFocus={showTooltip}
              onBlur={hideTooltip}
            >
              <span className={s.icon} aria-hidden="true">{icon}</span>
            </span>
          )
      }
      {showNote && <span className={s.note}>{formatNote(cell.note)}</span>}
      {(showNote || textOnly) && cell.url && <Link className={s.source} to={cell.url}>Source</Link>}
      {tooltipPosition && createPortal(
        <span className={s.tooltip} role="tooltip" style={{ left: tooltipPosition.x, top: tooltipPosition.y }}>
          <b>{label}</b>
          {cell.note && <span className={s.tooltipNote}>{formatNote(cell.note)}</span>}
        </span>,
        document.body
      )}
    </td>
  )
}
