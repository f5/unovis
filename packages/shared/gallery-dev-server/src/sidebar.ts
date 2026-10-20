import exampleMetadata from 'virtual:gallery-examples'
import { DEFAULT_SLUG, THEME_STORAGE_KEY, EXPANDED_CATEGORIES_STORAGE_KEY } from './constants'
import logo from '../../../website/static/img/unovis-logo.svg'
import logoDark from '../../../website/static/img/unovis-logo-dark-theme.svg'

function readStorage (key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage (key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Keep controls usable when browser storage is unavailable.
  }
}

export function getActiveSlug (available: string[]): string {
  const url = new URL(window.location.href)
  const requested = url.searchParams.get('example')
  if (requested && available.includes(requested)) return requested
  if (available.includes(DEFAULT_SLUG)) return DEFAULT_SLUG
  return available[0] ?? ''
}

export function renderSidebar (slugs: string[], activeSlug: string): void {
  const host = document.getElementById('sidebar')
  if (!host) return

  const categories = new Map<string, { slug: string; title: string }[]>()
  for (const { category } of Object.values(exampleMetadata)) categories.set(category, [])
  for (const slug of slugs) {
    const { title, category } = exampleMetadata[slug] ?? { title: slug.replace(/-/g, ' '), category: 'Other examples' }
    if (!categories.has(category)) categories.set(category, [])
    categories.get(category)?.push({ slug, title })
  }
  for (const [category, items] of categories) {
    if (!items.length) categories.delete(category)
  }

  let expanded = new Set<string>()
  try {
    expanded = new Set(JSON.parse(readStorage(EXPANDED_CATEGORIES_STORAGE_KEY) ?? '[]') as string[])
  } catch {
    expanded = new Set<string>()
  }
  const activeCategory = exampleMetadata[activeSlug]?.category ?? 'Other examples'
  expanded.add(activeCategory)

  const header = document.createElement('div')
  header.className = 'sidebar-header'
  const brand = document.createElement('img')
  brand.className = 'sidebar-logo'
  brand.alt = 'Unovis'
  const theme = document.createElement('button')
  theme.type = 'button'
  theme.className = 'sidebar-theme'
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
  let savedTheme = readStorage(THEME_STORAGE_KEY)
  const applyTheme = (dark: boolean): void => {
    brand.src = dark ? logoDark : logo
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.body.classList.toggle('theme-dark', dark)
    theme.textContent = dark ? '☀' : '☾'
    theme.title = dark ? 'Switch to light theme' : 'Switch to dark theme'
    theme.setAttribute('aria-label', theme.title)
    theme.setAttribute('aria-pressed', String(dark))
  }
  applyTheme(savedTheme ? savedTheme === 'dark' : systemTheme.matches)
  theme.addEventListener('click', (): void => {
    savedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    writeStorage(THEME_STORAGE_KEY, savedTheme)
    applyTheme(savedTheme === 'dark')
  })
  systemTheme.addEventListener('change', (event): void => {
    if (!savedTheme) applyTheme(event.matches)
  })
  header.append(brand, theme)

  const searchField = document.createElement('div')
  searchField.className = 'sidebar-search'
  const search = document.createElement('input')
  search.type = 'search'
  search.placeholder = 'Search examples'
  search.setAttribute('aria-label', 'Search examples')
  search.value = new URL(window.location.href).searchParams.get('search') ?? ''
  const hint = document.createElement('kbd')
  hint.textContent = '/'
  searchField.append(search, hint)

  const toolbar = document.createElement('div')
  toolbar.className = 'sidebar-toolbar'
  const count = document.createElement('span')
  count.setAttribute('aria-live', 'polite')
  const expand = document.createElement('button')
  expand.type = 'button'
  toolbar.append(count, expand)
  const list = document.createElement('nav')
  list.className = 'sidebar-list'
  list.setAttribute('aria-label', 'Gallery examples')
  host.replaceChildren(header, searchField, toolbar, list)

  const renderList = (): void => {
    const tokens = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean)
    const searching = tokens.length > 0
    let resultCount = 0
    list.replaceChildren()
    for (const [category, items] of categories) {
      const matches = items.filter(item => tokens.every(token => `${category} ${item.title} ${item.slug}`.toLowerCase().includes(token)))
      if (!matches.length) continue
      resultCount += matches.length
      const group = document.createElement('details')
      group.open = searching || expanded.has(category)
      const summary = document.createElement('summary')
      const name = document.createElement('span')
      name.textContent = category
      const total = document.createElement('span')
      total.className = 'sidebar-category-count'
      total.textContent = String(matches.length)
      summary.append(name, total)
      group.appendChild(summary)
      const links = document.createElement('ul')
      for (const item of matches) {
        const li = document.createElement('li')
        const link = document.createElement('a')
        const url = new URL(window.location.href)
        url.searchParams.set('example', item.slug)
        link.href = `${url.pathname}${url.search}${url.hash}`
        link.textContent = item.title
        link.title = item.slug
        if (item.slug === activeSlug) link.setAttribute('aria-current', 'page')
        li.appendChild(link)
        links.appendChild(li)
      }
      group.appendChild(links)
      group.addEventListener('toggle', (): void => {
        if (searching || !group.isConnected) return
        if (group.open) expanded.add(category)
        else expanded.delete(category)
        writeStorage(EXPANDED_CATEGORIES_STORAGE_KEY, JSON.stringify([...expanded]))
        expand.textContent = [...categories.keys()].every(key => expanded.has(key)) ? 'Collapse all' : 'Expand all'
      })
      list.appendChild(group)
    }
    count.textContent = searching ? `${resultCount} of ${slugs.length} examples` : `${slugs.length} examples`
    expand.textContent = [...categories.keys()].every(key => expanded.has(key)) ? 'Collapse all' : 'Expand all'
    expand.disabled = searching
    if (!resultCount) {
      const empty = document.createElement('p')
      empty.className = 'sidebar-empty'
      empty.textContent = 'No matching examples'
      list.appendChild(empty)
    }
  }

  search.addEventListener('input', (): void => {
    const url = new URL(window.location.href)
    if (search.value) url.searchParams.set('search', search.value)
    else url.searchParams.delete('search')
    window.history.replaceState(null, '', url)
    renderList()
  })
  expand.addEventListener('click', (): void => {
    expanded = [...categories.keys()].every(key => expanded.has(key)) ? new Set<string>() : new Set(categories.keys())
    writeStorage(EXPANDED_CATEGORIES_STORAGE_KEY, JSON.stringify([...expanded]))
    renderList()
  })
  window.addEventListener('keydown', (event): void => {
    const target = event.target as HTMLElement | null
    if (event.key === 'Escape' && target === search) {
      search.blur()
      return
    }
    if (target?.matches('input, textarea, select') || target?.isContentEditable) return
    if (event.key === '/' || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) {
      event.preventDefault()
      search.focus()
      search.select()
    }
  })
  renderList()
  requestAnimationFrame(() => list.querySelector<HTMLAnchorElement>('a[aria-current="page"]')?.scrollIntoView({ block: 'nearest' }))
}
