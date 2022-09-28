export function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

export function trimMultiline (str: string): string {
  const s = str.substring(str.indexOf('\n') + 1).trimEnd()
  const indent = ' '.repeat(s.length - s.trim().length)
  const re = new RegExp(indent, 'g')
  return str.replace(re, '')
}
