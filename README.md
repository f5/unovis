https://user-images.githubusercontent.com/755708/205744216-5e9efd10-794b-4ce1-9aca-580c34fad193.mp4

🟨  **Unovis** is a modular data visualization framework for React, Angular, Svelte, Vue, Solid and vanilla TypeScript or JavaScript:

* 📈 🗺 It has charts, maps, network graphs, and more!
* 🌳 Tree-shakable and supports individual component imports to reduce your bundle size;
* 🎨 Highly customizable, thanks to the CSS-variables support.

Learn more about _Unovis_ on [unovis.dev](https://unovis.dev)

## Quick Start
You can install the core of the library `@unovis/ts` and framework-specific packages (if you use React, Angular, or Svelte) from NPM:

```bash
npm install -P @unovis/ts @unovis/<react|angular|svelte|vue|solid>
```

Now you can import components and create your first chart! Here's how to build a simple line chart uising Unovis and React:

```tsx
import React, { useCallback } from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'

type DataRecord = { x: number; y: number }
const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

export function BasicLineChart (): JSX.Element {
  return (
    <VisXYContainer data={data}>
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
Looking for Angular, Svelte, Vue, or TypeScript examples? Check out the [Quick Start](https://unovis.dev/docs/quick-start) page on our website.

## Examples and Documentation
[![Unovis Examples](examples.png)](https://unovis.dev/gallery)

📖 _Unovis_ has an extensive [documentation](https://unovis.dev/docs/intro) with code snippets for React, Angular,
Svelte and TypeScript.

🖼 Also there's a growing [gallery](https://unovis.dev/gallery) of examples, from where you can copy the code over to your project or try it live on StackBlitz.

## Repository structure

* `packages/ts` Core TypeScript package
* `packages/angular` Angular components
* `packages/react` React components
* `packages/svelte` Svelte components
* `packages/vue` Vue components
* `packages/solid` Solid components
* `packages/website` Website, docs and examples

## Contributing
Pull requests are welcome. For major changes, please open an issue
first to discuss what you would like to change. For more information, please
read [CONTRIBUTING](CONTRIBUTING.md).

## Maintainers
[<img alt="Nikita Rokotyan" src="https://avatars.githubusercontent.com/u/755708" width="80"/>](https://github.com/rokotyan)
[<img alt="Rebecca Bol" src="https://avatars.githubusercontent.com/u/52078477" width="80"/>](https://github.com/reb-dev)
[<img alt="Qian Liu" src="https://avatars.githubusercontent.com/u/5026041" width="80"/>](https://github.com/lee00678)

## Contributors
[<img alt="Olga Stukova" src="https://avatars.githubusercontent.com/u/8654114" width="40"/>](https://github.com/stukova)
[<img alt="Sumit Kumar" src="https://avatars.githubusercontent.com/u/5867393" width="40"/>](https://github.com/sumitkumar25)
[<img alt="Gaurav Mukherjee" src="https://avatars.githubusercontent.com/u/6323787" width="40"/>](https://github.com/gmfun)
[<img alt="Beverly Ackah" src="https://avatars.githubusercontent.com/u/32556434" width="40"/>](https://github.com/beverlyckh)
[<img alt="Dmitriy Gutman" src="https://avatars.githubusercontent.com/u/14595706" width="40"/>](https://github.com/DimamoN)
[<img alt="zernonia" src="https://avatars.githubusercontent.com/u/59365435" width="40"/>](https://github.com/zernonia)
[<img alt="Yann イーベス Eves" src="https://avatars.githubusercontent.com/u/1331877" width="40"/>](https://github.com/yanneves)
[<img alt="Michael" src="https://avatars.githubusercontent.com/u/15652018" width="40"/>](https://github.com/TasoOneAsia)
[<img alt="Josh Larsen" src="https://avatars.githubusercontent.com/u/2565382" width="40"/>](https://github.com/joshlarsen)

## License
_Unovis_ is licensed under Apache-2.0
