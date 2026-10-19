import React from 'react'
import { Link } from 'react-router-dom'

// Styles
import s from './style.module.css'

export type NavigationItemProps = {
  title: string;
  group: string;
  subTitle?: string;
  isActive?: boolean;
  preservedSearch?: string;
  highlight?: string[];
}

type TextSegment = { text: string; isMatch: boolean }

function toSegments (text: string, tokens: string[]): TextSegment[] {
  const matchedRanges: [number, number][] = []
  const lowerCaseText = text.toLowerCase()

  for (const token of tokens) {
    const lowerCaseToken = token.toLowerCase()
    let index = lowerCaseText.indexOf(lowerCaseToken)
    while (index !== -1) {
      matchedRanges.push([index, index + lowerCaseToken.length])
      index = lowerCaseText.indexOf(lowerCaseToken, index + lowerCaseToken.length)
    }
  }
  if (!matchedRanges.length) return [{ text, isMatch: false }]

  matchedRanges.sort((a, b) => a[0] - b[0])

  const segments: TextSegment[] = []
  let cursor = 0
  for (const [start, end] of matchedRanges) {
    if (end <= cursor) continue
    const matchStart = Math.max(start, cursor)
    if (matchStart > cursor) segments.push({ text: text.slice(cursor, matchStart), isMatch: false })
    segments.push({ text: text.slice(matchStart, end), isMatch: true })
    cursor = end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), isMatch: false })

  return segments
}

function renderHighlightedText (text: string, tokens: string[]): React.ReactNode {
  const segments = tokens.length ? toSegments(text, tokens) : [{ text, isMatch: false }]

  return (
    <>
      {segments.map((segment, index) => (segment.isMatch
        ? <mark key={index} className={s.highlight}>{segment.text}</mark>
        : <React.Fragment key={index}>{segment.text}</React.Fragment>
      ))}
    </>
  )
}

export const NavigationItem = React.forwardRef<HTMLDivElement, NavigationItemProps>(function navigationItem (props, ref) {
  const search = new URLSearchParams(props.preservedSearch)
  if (!props.isActive) search.delete('config')
  const to = {
    pathname: `/examples/${encodeURIComponent(props.group)}/${encodeURIComponent(props.title)}`,
    search: search.toString() || undefined,
  }
  return (
    <div ref={ref} className={`${s.navItem}${props.isActive ? ` ${s.navItemActive}` : ''}`}>
      <Link to={to}>
        <div className={s.navItemTitle}>{renderHighlightedText(props.title, props.highlight ?? [])}</div>
        {props.subTitle && <div className={s.navItemSubTitle}>{renderHighlightedText(props.subTitle, props.highlight ?? [])}</div>}
      </Link>
    </div>
  )
})
