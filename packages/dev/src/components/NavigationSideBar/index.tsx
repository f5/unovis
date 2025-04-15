import { NavigationItem } from '@/components/NavigationItem'
// Examples
import { ExampleGroup } from '@/examples'
import Fuse from 'fuse.js'
import React, { useRef, useState } from 'react'
// Styles
import s from './style.module.css'


export type NavigationSideBarProps = {
  exampleGroups: ExampleGroup[];
}

export function NavigationSideBar (props: NavigationSideBarProps): React.ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const [groups, setGroups] = useState(props.exampleGroups)
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

  const fuse = new Fuse(props.exampleGroups, fuseOptions)
  const filterExamples = (): void => {
    const searchTerm = inputRef.current?.value
    if (!searchTerm) {
      setGroups(props.exampleGroups)
    } else {
      const result = fuse.search(searchTerm)
      setGroups(result.map(d => ({
        title: d.item.title,
        items: [...new Set(d.matches?.map(match => d.item.items[match.refIndex as number]) || [])],
      })))
    }
  }

  return (
    <div className={s.navSideBar}>
      <div className={s.navSideBarInput}>
        <input ref={inputRef} onChange={filterExamples} type='text' placeholder="Find examples"/>
      </div>
      <div className={s.navItems}>
        {groups.map(group => <div key={group.title}>
          <div className={s.navItemGroup}>{group.title}</div>
          {group.items.map(item => (
            <NavigationItem key={item.title} group={group.title} {...item} />)
          )}
        </div>
        )}
        {!groups.length && <div className={s.navNotFound}>
          🔎 No results for "{inputRef.current?.value}"
        </div>}
      </div>
    </div>
  )
}
