import React, { useRef, useState } from 'react'
import Fuse from 'fuse.js'

import { NavigationItem } from '@src/components/NavigationItem'

// Examples
import { ExampleGroup } from '@src/examples'

// Styles
import s from './style.module.css'

export type NavigationSideBarProps = {
  exampleGroups: ExampleGroup[];
}

export function NavigationSideBar (props: NavigationSideBarProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  const [groups, setGroups] = useState(props.exampleGroups)
  const fuseOptions = {
    includeScore: true,
    includeMatches: true,
    keys: ['items.title'],
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
        items: d.matches?.map(match => d.item.items[match.refIndex as number]) ?? [],
      })))
    }
  }

  return (
    <div className={s.navSideBar}>
      <div className={s.navSideBarInput}>
        <input ref={inputRef} onChange={filterExamples} type='text' placeholder="Find examples"/>
      </div>
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
  )
}
