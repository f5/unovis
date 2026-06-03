const DEFAULT_SLUG = 'basic-boxplot'

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

  const heading = document.createElement('h2')
  heading.textContent = 'Examples'
  host.appendChild(heading)

  const list = document.createElement('ul')
  for (const slug of slugs) {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = `?example=${encodeURIComponent(slug)}`
    a.textContent = slug
    if (slug === activeSlug) a.className = 'active'
    li.appendChild(a)
    list.appendChild(li)
  }
  host.appendChild(list)
}
