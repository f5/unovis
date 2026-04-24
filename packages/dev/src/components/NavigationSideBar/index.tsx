import React, { useLayoutEffect, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { useMatch, useSearchParams } from 'react-router-dom'

import { NavigationItem } from '@src/components/NavigationItem'

// Examples
import { ExampleGroup } from '@src/examples'

// Styles
import s from './style.module.css'

export type NavigationSideBarProps = {
  exampleGroups: ExampleGroup[];
}

const fuseOptions = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.2, // Lower threshold for stricter matching
  keys: [
    { name: 'items.title', weight: 2 }, // Give more weight to title matches
    { name: 'items.subTitle', weight: 1 },
    { name: 'items.category', weight: 1 },
  ],
}

function readInitialSearchQuery (): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('q') ?? ''
}

function filterExampleGroups (exampleGroups: ExampleGroup[], searchTerm: string): ExampleGroup[] {
  if (!searchTerm?.trim()) return exampleGroups
  const fuse = new Fuse(exampleGroups, fuseOptions)
  const result = fuse.search(searchTerm)
  return result.map(d => ({
    title: d.item.title,
    items: [...new Set(d.matches?.map(match => d.item.items[match.refIndex as number]) || [])],
  }))
}

export function NavigationSideBar (props: NavigationSideBarProps): React.ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const activeItemRef = useRef<HTMLDivElement>(null)
  const didScrollToActiveRef = useRef(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const preservedSearch = searchParams.toString()
  const [groups, setGroups] = useState(() => filterExampleGroups(props.exampleGroups, readInitialSearchQuery()))
  const exampleMatch = useMatch({ path: '/examples/:group/:title', end: true })

  const filterExamples = (): void => {
    const searchTerm = inputRef.current?.value ?? ''
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (searchTerm.trim()) next.set('q', searchTerm)
      else next.delete('q')
      return next
    }, { replace: true })
    setGroups(filterExampleGroups(props.exampleGroups, searchTerm))
  }

  useLayoutEffect(() => {
    if (didScrollToActiveRef.current) return
    if (!exampleMatch?.params.group || !exampleMatch.params.title) return
    const el = activeItemRef.current
    if (!el) return
    el.scrollIntoView({ block: 'start', behavior: 'auto' })
    didScrollToActiveRef.current = true
  }, [exampleMatch?.params.group, exampleMatch?.params.title, groups])

  return (
    <div className={s.navSideBar}>
      <div className={s.navSideBarInput}>
        <input ref={inputRef} defaultValue={readInitialSearchQuery()} onChange={filterExamples} type='text' placeholder="Find examples"/>
      </div>
      <div className={s.navItems}>
        {groups.map(group => <div key={group.title}>
          <div className={s.navItemGroup}>{group.title}</div>
          {group.items.map(item => {
            const isActive = exampleMatch?.params.group === group.title && exampleMatch?.params.title === item.title
            return (
              <NavigationItem
                key={item.title}
                ref={isActive ? activeItemRef : undefined}
                group={group.title}
                {...item}
                isActive={isActive}
                preservedSearch={preservedSearch}
              />
            )
          })}
        </div>
        )}
        {!groups.length && <div className={s.navNotFound}>
          🔎 No results for "{inputRef.current?.value}"
        </div>}
      </div>
    </div>
  )
}
