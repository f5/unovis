import React, { ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMatch, useSearchParams } from 'react-router-dom'

import { useAppContext } from '@src/AppContext'
import { NavigationItem } from '@src/components/NavigationItem'

// Examples
import { ExampleSectionGroup } from '@src/examples'

import { createExampleSearch, getSearchTokens } from './search'
import { useSidebarWidth } from './useSidebarWidth'
import { EXPANDED_GROUPS_STORAGE_KEY, SEARCH_QUERY_PARAMETER } from './constants'

// Styles
import s from './style.module.css'
import logo from './unovis-logo.svg?raw'
import logoDark from './unovis-logo-dark-theme.svg?raw'

export type NavigationSideBarProps = {
  exampleSections: ExampleSectionGroup[];
}

function readExpandedGroups (): string[] | null {
  try {
    const stored = window.localStorage.getItem(EXPANDED_GROUPS_STORAGE_KEY)
    return stored ? JSON.parse(stored) as string[] : null
  } catch {
    return null
  }
}

function writeExpandedGroups (groups: string[]): void {
  try {
    window.localStorage.setItem(EXPANDED_GROUPS_STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // Storage is unavailable in private windows; expansion stays session-only.
  }
}

function countExamples (sections: ExampleSectionGroup[]): number {
  return sections.reduce(
    (total, section) => total + section.groups.reduce((count, group) => count + group.items.length, 0),
    0
  )
}

export function NavigationSideBar (props: NavigationSideBarProps): React.ReactNode {
  const [searchParams, setSearchParams] = useSearchParams()
  const exampleMatch = useMatch({ path: '/examples/:group/:title', end: true })
  const activeItemRef = useRef<HTMLDivElement>(null)
  const didScrollToActiveRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isCodeHidden, setIsCodeHidden, isDarkTheme } = useAppContext()
  const { width, isResizing, onResizeStart, onResizeReset } = useSidebarWidth()

  const searchTerm = searchParams.get(SEARCH_QUERY_PARAMETER) ?? ''
  const activeGroup = exampleMatch?.params.group

  const search = useMemo(() => createExampleSearch(props.exampleSections), [props.exampleSections])
  const sections = useMemo(() => search(searchTerm), [search, searchTerm])
  const highlightTokens = useMemo(() => getSearchTokens(searchTerm), [searchTerm])

  const totalCount = useMemo(() => countExamples(props.exampleSections), [props.exampleSections])
  const resultCount = useMemo(() => countExamples(sections), [sections])

  const allGroupTitles = useMemo(
    () => props.exampleSections.flatMap(section => section.groups.map(group => group.title)),
    [props.exampleSections]
  )

  // Numbered off the full sidebar so a section keeps its number while search filters the list.
  const sectionNumbers = useMemo(
    () => new Map(props.exampleSections.map((section, index) => [section.title, String(index + 1).padStart(2, '0')])),
    [props.exampleSections]
  )

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const stored = readExpandedGroups()
    if (stored) return new Set([...stored, ...(activeGroup ? [activeGroup] : [])])
    return new Set(activeGroup ? [activeGroup] : [])
  })

  useEffect(() => {
    if (!activeGroup) return
    setExpandedGroups(previous => (previous.has(activeGroup) ? previous : new Set([...previous, activeGroup])))
  }, [activeGroup])

  useLayoutEffect(() => {
    if (didScrollToActiveRef.current || !activeItemRef.current) return
    activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' })
    didScrollToActiveRef.current = true
  }, [activeGroup, sections, expandedGroups])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if (event.key === 'Escape' && target === inputRef.current) {
        inputRef.current?.blur()
        return
      }
      if (isTyping) return
      if (event.key === '/' || (event.key === 'k' && (event.metaKey || event.ctrlKey))) {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const setSearchTerm = useCallback((nextSearchTerm: string): void => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (!nextSearchTerm) nextSearchParams.delete(SEARCH_QUERY_PARAMETER)
    else nextSearchParams.set(SEARCH_QUERY_PARAMETER, nextSearchTerm)

    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  const toggleGroup = useCallback((groupTitle: string): void => {
    setExpandedGroups((previous) => {
      const next = new Set(previous)
      if (next.has(groupTitle)) next.delete(groupTitle)
      else next.add(groupTitle)
      writeExpandedGroups([...next])
      return next
    })
  }, [])

  const isSearching = highlightTokens.length > 0
  const areAllExpanded = allGroupTitles.every(title => expandedGroups.has(title))

  const toggleAllGroups = useCallback((): void => {
    const next = areAllExpanded ? new Set<string>() : new Set(allGroupTitles)
    writeExpandedGroups([...next])
    setExpandedGroups(next)
  }, [areAllExpanded, allGroupTitles])

  const isExampleOpen = Boolean(activeGroup)

  return (
    <nav className={s.navSideBar} style={{ flexBasis: width, width }}>
      <div className={s.header}>
        <img className={s.headerLogo} src={`data:image/svg+xml,${encodeURIComponent(isDarkTheme ? logoDark : logo)}`} alt="Unovis"/>
        <button
          className={`${s.codeButton} ${!isCodeHidden ? s.codeButtonActive : ''}`}
          onClick={() => setIsCodeHidden(!isCodeHidden)}
          disabled={!isExampleOpen}
          aria-label={isCodeHidden ? 'Show source code' : 'Hide source code'}
          aria-pressed={!isCodeHidden}
          title={isExampleOpen
            ? (isCodeHidden ? 'Show the source code panel' : 'Hide the source code panel')
            : 'Open an example to see its source'}
        >
          <svg className={s.codeIcon} viewBox="0 0 16 16" aria-hidden="true">
            <polyline points="5.5,4.5 2,8 5.5,11.5" />
            <polyline points="10.5,4.5 14,8 10.5,11.5" />
          </svg>
          Code
        </button>
      </div>

      <div className={s.searchField}>
        <svg className={s.searchIcon} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          ref={inputRef}
          className={s.searchInput}
          value={searchTerm}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
          type="text"
          placeholder="Search examples"
          spellCheck={false}
          aria-label="Search examples"
        />
        {searchTerm
          ? <button className={s.searchClear} onClick={() => setSearchTerm('')} title="Clear search">✕</button>
          : <span className={s.searchHint}>/</span>}
      </div>

      <div className={s.toolbar}>
        <span className={s.toolbarCount}>
          {isSearching ? `${resultCount} of ${totalCount}` : `${totalCount} examples`}
        </span>
        {!isSearching && (
          <button className={s.toolbarButton} onClick={toggleAllGroups}>
            {areAllExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>

      <div className={s.navItems}>
        {sections.map(section => (
          <section key={section.title} className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndex}>{sectionNumbers.get(section.title)}</span>
              <span className={s.sectionDot}>·</span>
              <span className={s.sectionTitle}>{section.title}</span>
              <span className={s.sectionRule} />
            </div>
            {section.groups.map((group) => {
              const isExpanded = isSearching || expandedGroups.has(group.title)
              return (
                <div key={group.title} className={s.group}>
                  <button
                    className={`${s.groupHeader} ${isExpanded ? s.groupHeaderExpanded : ''}`}
                    onClick={() => toggleGroup(group.title)}
                    aria-expanded={isExpanded}
                  >
                    <svg className={s.groupChevron} viewBox="0 0 12 12" aria-hidden="true">
                      <polyline points="4,2 8,6 4,10" />
                    </svg>
                    <span className={s.groupTitle}>{group.title}</span>
                    <span className={s.groupCount}>{group.items.length}</span>
                  </button>
                  {isExpanded && (
                    <div className={s.groupItems}>
                      {group.items.map(item => (
                        <NavigationItem
                          key={item.title}
                          ref={activeGroup === group.title && exampleMatch?.params.title === item.title ? activeItemRef : undefined}
                          isActive={activeGroup === group.title && exampleMatch?.params.title === item.title}
                          preservedSearch={searchParams.toString()}
                          group={group.title}
                          title={item.title}
                          subTitle={item.subTitle}
                          highlight={highlightTokens}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        ))}
        {!sections.length && (
          <div className={s.navNotFound}>
            No examples match “{searchTerm}”
          </div>
        )}
      </div>

      <div
        className={`${s.resizeHandle} ${isResizing ? s.resizeHandleActive : ''}`}
        onPointerDown={onResizeStart}
        onDoubleClick={onResizeReset}
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize, double-click to reset"
      />
    </nav>
  )
}
