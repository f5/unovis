import type { CSSProperties } from 'react'

/** The range the "30-day window" preset starts on: the last 30 days of the year */
export const LAST_30_DAYS: [Date, Date] = [new Date(2025, 11, 2), new Date(2025, 11, 31)]

/** The line above every chart that names the selected days and their total */
export const READOUT_STYLE: CSSProperties = { height: 24, fontSize: 13, lineHeight: '24px', whiteSpace: 'nowrap', overflow: 'hidden' }
