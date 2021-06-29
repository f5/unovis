// Copyright (c) Volterra, Inc. All rights reserved.
import { keys } from 'ts-transformer-keys'
import { writeFileSync } from 'fs'
import { exec } from 'child_process'
import {
  // XYComponentConfigInterface has to be imported so ts-transformer-keys gets its keys
  XYComponentConfigInterface, LineConfigInterface, AreaConfigInterface, AxisConfigInterface, BrushConfigInterface,
  CrosshairConfigInterface, GroupedBarConfigInterface, ScatterConfigInterface, StackedBarConfigInterface,
  TimelineConfigInterface, DonutConfigInterface,
} from '@volterra/vis'

type D = any
const components = {
  Line: { keys: keys<LineConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Area: { keys: keys<AreaConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Axis: { keys: keys<AxisConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Brush: { keys: keys<BrushConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Crosshair: { keys: keys<CrosshairConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Donut: { keys: keys<DonutConfigInterface<D>>(), generics: '<T>', provide: 'VisCoreComponent' },
  GroupedBar: { keys: keys<GroupedBarConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Scatter: { keys: keys<ScatterConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  StackedBar: { keys: keys<StackedBarConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
  Timeline: { keys: keys<TimelineConfigInterface<D>>(), generics: '<T>', provide: 'VisXYComponent' },
}

function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

for (const [componentName, data] of Object.entries(components)) {
  const nameKebabCase = kebabCase(componentName)
  const configKeys = data.keys as string[]
  const generics = data.generics
  const provide = data.provide
  const generatedCode = `// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { ${componentName}, ${componentName}ConfigInterface } from '@volterra/vis'
import { ${provide} } from '@src/core'

@Directive({
  selector: 'vis-${nameKebabCase}',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: ${provide}, useExisting: Vis${componentName}Component }],
})
export class Vis${componentName}Component${generics} implements ${componentName}ConfigInterface${generics}, AfterViewInit {
  ${configKeys.map((key: string) => `@Input() ${key}: any`).join('\n')}
  @Input() data: any

  component: ${componentName}${generics} | undefined

  ngAfterViewInit (): void {
    this.component = new ${componentName}${generics}(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): ${componentName}ConfigInterface${generics} {
    const { ${configKeys.join(', ')} } = this
    const config = { ${configKeys.join(', ')} }
    const keys = Object.keys(config) as (keyof ${componentName}ConfigInterface${generics})[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
`
  const moduleCode = `// !!! This code was automatically generated. You should not change it !!!
import { NgModule } from '@angular/core'
import { Vis${componentName}Component } from './${nameKebabCase}.directive'

@NgModule({
  imports: [],
  declarations: [Vis${componentName}Component],
  exports: [Vis${componentName}Component],
})
export class Vis${componentName}Module {}
`
  const basePath = `src/components/${nameKebabCase}`
  const pathComponent = `${basePath}/${nameKebabCase}.directive.ts`
  const pathModule = `${basePath}/${nameKebabCase}.module.ts`

  exec(`mkdir ${basePath}`, () => {
    writeFileSync(pathComponent, generatedCode)
    writeFileSync(pathModule, moduleCode)
    exec(`npx eslint ${pathComponent} ${pathModule} --fix`)
  })
}

const exports = `// !!! This code was automatically generated. You should not change it !!!
  ${Object.keys(components).map(
    componentName => `export { Vis${componentName}Component } from './components/${kebabCase(componentName)}/${kebabCase(componentName)}.directive'`
  ).join('\n')}
`

const componentExportsFilePath = './src/components.ts'
writeFileSync(componentExportsFilePath, exports)
exec(`npx eslint ${componentExportsFilePath} --fix`)
