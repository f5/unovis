![cover](https://user-images.githubusercontent.com/755708/194946760-13db0396-c429-4abb-8324-a5efae0455e2.png)

🟨 **Unovis** is a modular data visualization framework for React, Angular, Svelte, and vanilla TypeScript or JavaScript.

`@unovis/react` provides React components for `@unovis/ts`, which makes Unovis integration into a React
app much easier.

Learn more about **Unovis** on our website [unovis.dev](https://unovis.dev)

## Installation
```bash
npm install -P @unovis/ts @unovis/react
```

## Quick Start
#### TypeScript
```typescript jsx
import React, { useCallback } from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'

export type DataRecord = { x: number; y: number }
export const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

export function BasicLineChart (): JSX.Element {
  return (
    <VisXYContainer data={data} height={600}>
      <VisLine<DataRecord>
        x={useCallback(d => d.x, [])}
        y={useCallback(d => d.y, [])}
      ></VisLine>
      <VisAxis type="x"></VisAxis>
      <VisAxis type="y"></VisAxis>
    </VisXYContainer>
  )
}
```

#### JavaScript
```jsx
import React, { useCallback } from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'

export const data = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

export function BasicLineChart () {
  return (
    <VisXYContainer data={data} height={600}>
      <VisLine
        x={useCallback(d => d.x, [])}
        y={useCallback(d => d.y, [])}
      ></VisLine>
      <VisAxis type="x"></VisAxis>
      <VisAxis type="y"></VisAxis>
    </VisXYContainer>
  )
}
```

## Documentation
https://unovis.dev/docs/intro

## Examples
https://unovis.dev/gallery

## License
Apache-2.0
