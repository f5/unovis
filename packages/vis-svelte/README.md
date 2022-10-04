🟨 **Unovis** is a modular data visualization framework for React, Angular, Svelte, and vanilla TypeScript or JavaScript.

`@unovis/svelte` provides Svelte components for `@unovis/ts`, which makes Unovis integration into a Svelte
app much easier.

Learn more about **Unovis** on our website [unovis.dev](https://unovis.dev)

## Installation
```bash
npm install -P @unovis/ts @unovis/svelte
```

## Quick Start
```sveltehtml
<script>
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/svelte'

  export let data = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ]
</script>

<VisXYContainer height={600}>
  <VisLine {data} x={d => d.x} y={d => d.y}/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
</VisXYContainer>
```

## Documentation
https://unovis.dev/docs

## Examples
https://unovis.dev/gallery

## License
Apache-2.0
