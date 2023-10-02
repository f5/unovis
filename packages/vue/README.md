![cover](https://user-images.githubusercontent.com/755708/194946760-13db0396-c429-4abb-8324-a5efae0455e2.png)

🟨 **Unovis** is a modular data visualization framework for React, Angular, Svelte, Vue and vanilla TypeScript or JavaScript.

`@unovis/vue` provides Vue components for `@unovis/ts`, which makes Unovis integration into a Vue
app much easier.

Learn more about **Unovis** on our website [unovis.dev](https://unovis.dev)

## Installation
```bash
npm install -P @unovis/ts @unovis/vue
```

## Quick Start
#### TypeScript
```vue
<script setup lang="ts">
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
  import { ref } from 'vue'

  type DataRecord = { x: number; y: number }
  const data = ref<DataRecord>([
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ])
  const x = (d: DataRecord) => d.x
  const y = (d: DataRecord) => d.y
</script>

<VisXYContainer :height="600">
  <VisLine :data="data" :x="x" :y="y"/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
</VisXYContainer>
```

#### JavaScript
```vue
<script>
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
  import { ref } from 'vue'

  export let data = ref([
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ])
  const x = d => d.x
  const y = d => d.y
</script>

<VisXYContainer :height="600">
  <VisLine :data="data" :x="x" :y="y"/>
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
