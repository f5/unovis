![cover](https://user-images.githubusercontent.com/755708/194946760-13db0396-c429-4abb-8324-a5efae0455e2.png)

🟨 **Unovis** is a modular data visualization framework for React, Angular, Svelte, Vue, Solid and vanilla TypeScript or JavaScript.

`@unovis/solid` provides Solid components for `@unovis/ts`, which makes Unovis integration into a Solid
app much easier.

Learn more about **Unovis** on our website [unovis.dev](https://unovis.dev)

## Installation
```bash
npm install -P @unovis/ts @unovis/solid
```

## Quick Start
#### TypeScript
```ts
import { VisXYContainer, VisLine, VisAxis } from '@unovis/solid'

type DataRecord = { x: number; y: number }
const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

const BasicLineChart = () => {
  return (
    <VisXYContainer height='50dvh'>
      <VisLine data={data} x={(d) => d.x} y={(d) => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  )
}

export default BasicLineChart
```

## Documentation
https://unovis.dev/docs/intro

## Examples
https://unovis.dev/gallery

## License
Apache-2.0
