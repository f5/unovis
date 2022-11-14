![cover](https://user-images.githubusercontent.com/755708/194946760-13db0396-c429-4abb-8324-a5efae0455e2.png)

🟨 **Unovis** is a modular data visualization framework for React, Angular, Svelte, and vanilla TypeScript or JavaScript.

`@unovis/angular` provides Angular modules to `@unovis/ts`, which makes Unovis integration into an Angular
app much easier.

Learn more about **Unovis** on our website [unovis.dev](https://unovis.dev)

## Installation
```bash
npm install -P @unovis/ts @unovis/angular
```

## Quick Start
#### HTML
```html
<vis-xy-container [height]="500">
    <vis-line [data]="data" [x]="x" [y]="y"></vis-line>
    <vis-axis type="x"></vis-axis>
    <vis-axis type="y"></vis-axis>
</vis-xy-container>
```
#### Component
```ts
import { Component } from '@angular/core'

type DataRecord = { x: number; y: number }

@Component({
  selector: 'basic-line-chart',
  templateUrl: './basic-line-chart.component.html'
})
export class BasicLineChartComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data: DataRecord[] = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ]
}
```
#### Module
```ts
import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule } from '@unovis/angular'

import { BasicLineChartComponent } from './basic-line-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule],
  declarations: [BasicLineChartComponent],
  exports: [BasicLineChartComponent],
})
export class BasicLineChartModule { }
```

## Documentation
https://unovis.dev/docs

## Examples
https://unovis.dev/gallery

## License
Apache-2.0
