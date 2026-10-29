import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { sources } from './data'

/** The icon size in pixels, the same for every library */
export const ICON_SIZE = 16

const strokeProps = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** One 24×24 stroke icon per traffic source, in `sources` order */
const shapes: JSX.Element[] = [
  // Organic search
  <><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16" y2="16"/></>,
  // Direct
  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  // Referral
  <><path d="M10 14a4 4 0 0 0 5.6.4l3-3a4 4 0 0 0-5.6-5.6l-1.7 1.7"/><path d="M14 10a4 4 0 0 0-5.6-.4l-3 3a4 4 0 0 0 5.6 5.6l1.7-1.7"/></>,
  // Social
  <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/></>,
  // Email
  <><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></>,
  // Paid search
  <><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
]

/** The id of a source's `<symbol>` in `IconSymbols` */
export const iconId = (source: string): string => `donut-icon-${sources.indexOf(source)}`

/** The icons as `<symbol>`s that take their color from `currentColor`, for an inline `<defs>` */
export const IconSymbols = (): JSX.Element => (
  <>
    {sources.map((source, i) => (
      <symbol key={source} id={iconId(source)} viewBox="0 0 24 24" {...strokeProps} stroke="currentColor">{shapes[i]}</symbol>
    ))}
  </>
)

/** The same symbols as markup, for the Unovis container's `svgDefs` */
export const ICON_SYMBOLS = renderToStaticMarkup(<IconSymbols/>)

/** A source's icon as a standalone white SVG data URL, for libraries that only take images */
export const iconDataUrl = (source: string): string => {
  const svg = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...strokeProps} stroke="white">{shapes[sources.indexOf(source)]}</svg>
  return `data:image/svg+xml;utf8,${encodeURIComponent(renderToStaticMarkup(svg))}`
}
