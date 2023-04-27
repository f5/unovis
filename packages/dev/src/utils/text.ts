export const kebabToTitleCase = (s: string): string => s.replace(/(^|-)([a-z])/g, (_, a, b) => `${a.replace('-', ' ')}${b.toUpperCase()}`)
