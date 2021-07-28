// Copyright (c) Volterra, Inc. All rights reserved.
import { readFileSync, writeFileSync } from 'fs'
import { exec } from 'child_process'
import ts from 'typescript'

// Utils
import { getImportStatements, getConfigProperties, kebabCase } from './utils'
import { getComponentCode } from './component'
import { getModuleCode } from './module'

const volterraVisBasePath = '../vis/src/components'
const configFileName = '/config.ts'
const components = [
  // XY Components
  { name: 'Line', path: '/line', provide: 'VisXYComponent' },
  { name: 'Area', path: '/area', provide: 'VisXYComponent' },
  { name: 'Axis', path: '/axis', provide: 'VisXYComponent' },
  { name: 'Brush', path: '/brush', provide: 'VisXYComponent' },
  { name: 'FreeBrush', path: '/free-brush', provide: 'VisXYComponent' },
  { name: 'Crosshair', path: '/crosshair', provide: 'VisXYComponent' },
  { name: 'Donut', path: '/donut', provide: 'VisXYComponent' },
  { name: 'GroupedBar', path: '/grouped-bar', provide: 'VisXYComponent' },
  { name: 'Scatter', path: '/scatter', provide: 'VisXYComponent' },
  { name: 'StackedBar', path: '/stacked-bar', provide: 'VisXYComponent' },

  // Single components
  { name: 'Timeline', path: '/timeline', provide: 'VisCoreComponent' },
]

for (const component of components) {
  const path = `${volterraVisBasePath}${component.path}${configFileName}`
  const code = readFileSync(path, 'utf8')
  const parsed = ts.createSourceFile(configFileName, code, ts.ScriptTarget.Latest)

  const configInterface = parsed.statements.find(node => ts.isInterfaceDeclaration(node)) as ts.InterfaceDeclaration
  if (!configInterface) {
    console.error('Config Interface was not found, ', path)
    continue
  }

  const generics = configInterface.typeParameters?.map(t => t.name.escapedText) as string[]
  const configProperties = getConfigProperties(configInterface)
  const importStatements = getImportStatements(parsed.statements, configInterface, generics)

  const componentCode = getComponentCode(
    component.name,
    generics,
    configProperties,
    component.provide,
    importStatements
  )
  const moduleCode = getModuleCode(component.name)

  const nameKebabCase = kebabCase(component.name)
  const pathComponentBase = `src/components/${nameKebabCase}`
  const pathComponent = `${pathComponentBase}/${nameKebabCase}.component.ts`
  const pathModule = `${pathComponentBase}/${nameKebabCase}.module.ts`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    writeFileSync(pathModule, moduleCode)
    exec(`npx eslint ${pathComponent} ${pathModule} --fix`)
  })

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathModule}`)
}
