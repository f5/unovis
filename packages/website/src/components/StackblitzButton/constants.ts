import { Framework } from '@site/src/types/code'

export const frameworkLabels: Record<Framework, string> = {
  [Framework.React]: 'React',
  [Framework.Angular]: 'Angular',
  [Framework.Svelte]: 'Svelte',
  [Framework.Vue]: 'Vue',
  [Framework.Solid]: 'Solid',
  [Framework.TypeScript]: 'vanilla TypeScript',
}

export const copyLabels = {
  idle: 'Copy prompt',
  copied: 'Copied!',
  error: 'Copy failed — try again',
}
