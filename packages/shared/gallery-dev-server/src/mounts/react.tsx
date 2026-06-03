import React from 'react'
import { createRoot } from 'react-dom/client'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function mountReact (target: HTMLElement, Component: React.ComponentType): void {
  createRoot(target).render(<Component />)
}
