![cover](https://user-images.githubusercontent.com/755708/194946760-13db0396-c429-4abb-8324-a5efae0455e2.png)

🟨 **Unovis** is a modular data visualization framework for React, Angular, Svelte, and vanilla TypeScript or JavaScript.

`@unovis/ts` is the main package of Unovis. It contains the actual source code of all the components and
can be use in a pure TypeScript or JavaScript app.

Learn more about **Unovis** on our website [unovis.dev](https://unovis.dev)

## Installation
```bash
npm install -P @unovis/ts
```

## Quick Start
#### TypeScript
```ts
import { Axis, Line, XYContainer } from '@unovis/ts'

type DataRecord = { x: number; y: number }

const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const container = document.getElementById('vis-container')
const chart = new XYContainer(container, {
  components: [line],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
```

#### JavaScript
```javascript
import { Axis, Line, XYContainer } from '@unovis/ts'

const data = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

const line = new Line({
  x: d => d.x,
  y: d => d.y,
})

const container = document.getElementById('vis-container')
const chart = new XYContainer(container, {
  components: [line],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
```

## Documentation
https://unovis.dev/docs

## Examples
https://unovis.dev/gallery

## License
Apache-2.0
