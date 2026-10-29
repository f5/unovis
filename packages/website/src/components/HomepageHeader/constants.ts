export const HERO_GRADIENT_COLORS = {
  yellow: 'rgb(255,214,81)',
  grey: 'rgb(142,141,149)',
  red: 'rgb(226,32,58)',
  dark: 'rgb(23,19,41)',
  blue: '#2780EB',
  sand: 'rgb(190,178,139)',
}

export const HERO_REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

/** The prompt the hero's copy button puts on the clipboard, for adding Unovis to a project with a coding agent */
export const HERO_AGENT_PROMPT = `Add Unovis (https://unovis.dev) to this project as its data visualization library.

- Work out which UI framework the project uses (React, Angular, Vue, Svelte or Solid, or none) and install the matching package together with the core: @unovis/ts plus @unovis/react, @unovis/angular, @unovis/vue, @unovis/svelte or @unovis/solid. Without a framework, @unovis/ts alone is enough.
- Import components, containers, enums and types directly from the modules that define them, never from a package root barrel. For example:
  import { VisXYContainer } from '@unovis/react/containers/xy-container'
  import { VisLine } from '@unovis/react/components/line'
  import { CurveType } from '@unovis/ts/types/curve'
  or, without a framework, import { Line } from '@unovis/ts/components/line'.
- The docs index is at https://unovis.dev/llms.txt. Options are documented in the type definitions with their defaults, so read them from the installed package.
- Keep charts themeable through Unovis' CSS variables and make sure they look right in both light and dark mode.`

export const HERO_COPY_LABELS = {
  idle: 'Copy Prompt',
  copied: 'Copied!',
  error: 'Copy failed — try again',
}

/** How long the copied / failed state shows before the button resets, in milliseconds */
export const HERO_COPY_RESET_DELAY = 2000
