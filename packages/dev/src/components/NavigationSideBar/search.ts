import Fuse from 'fuse.js'

import { ExampleItem, ExampleSectionGroup } from '@src/examples'

import { EXTENDED_SEARCH_OPERATORS } from './constants'

type SearchEntry = {
  item: ExampleItem;
  searchText: string;
}

export function getSearchTokens (searchTerm: string): string[] {
  return searchTerm.replace(EXTENDED_SEARCH_OPERATORS, ' ').trim().split(/\s+/).filter(Boolean)
}

export function createExampleSearch (
  sections: ExampleSectionGroup[]
): (searchTerm: string) => ExampleSectionGroup[] {
  const entries: SearchEntry[] = sections.flatMap(section => section.groups.flatMap(group => group.items.map(item => ({
    item,
    searchText: [item.title, item.subTitle, group.title, section.title].filter(Boolean).join(' '),
  }))))

  const fuse = new Fuse(entries, {
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    keys: ['searchText'],
  })

  return (searchTerm: string): ExampleSectionGroup[] => {
    const tokens = getSearchTokens(searchTerm)
    if (!tokens.length) return sections

    const matchedItems = new Set(fuse.search(tokens.join(' ')).map(result => result.item.item))
    if (!matchedItems.size) return []

    const keepMatched = (items: ExampleItem[]): ExampleItem[] => items.filter(item => matchedItems.has(item))

    return sections
      .map(section => ({
        title: section.title,
        groups: section.groups
          .map(group => ({ title: group.title, items: keepMatched(group.items) }))
          .filter(group => group.items.length > 0),
      }))
      .filter(section => section.groups.length > 0)
  }
}
