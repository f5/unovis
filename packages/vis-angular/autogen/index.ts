// Copyright (c) Volterra, Inc. All rights reserved.
import { writeFileSync } from 'fs'
import { exec } from 'child_process'
import ts from 'typescript'

// Utils
import { getImportStatements, getConfigProperties, kebabCase, getTSStatements } from './utils'
import { getComponentCode } from './component'
import { getModuleCode } from './module'
import { ConfigProperty } from './types'

const volterraVisBasePath = '../vis/src'
const configFileName = '/config.ts'
const coreComponentConfigPath = '/core/component'
const xyComponentConfigPath = '/core/xy-component'
const skipProperties = ['width', 'height']
const components = [
  // XY Components
  { name: 'Line', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/line'], provide: 'VisXYComponent' },
  { name: 'Area', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/area'], provide: 'VisXYComponent' },
  { name: 'Axis', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/axis'], provide: 'VisXYComponent' },
  { name: 'Brush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/brush'], provide: 'VisXYComponent' },
  { name: 'FreeBrush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/free-brush'], provide: 'VisXYComponent' },
  { name: 'Crosshair', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/crosshair'], provide: 'VisXYComponent' },
  { name: 'GroupedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/grouped-bar'], provide: 'VisXYComponent' },
  { name: 'Scatter', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/scatter'], provide: 'VisXYComponent' },
  { name: 'StackedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/stacked-bar'], provide: 'VisXYComponent' },
  { name: 'Timeline', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/timeline'], provide: 'VisXYComponent' },

  // Single components
  { name: 'Donut', sources: [coreComponentConfigPath, '/components/donut'], provide: 'VisCoreComponent' },
]

for (const component of components) {
  const configPropertiesMap = new Map<string, ConfigProperty>() // The map of all config properties
  let statements: ts.Statement[] = [] // Statements and ...
  let configInterfaceMembers: ts.TypeElement[] = [] // ... config interface members to resolve imports of custom types
  let generics: string[] = [] // Generics

  for (const [i, path] of component.sources.entries()) {
    const fullPath = `${volterraVisBasePath}${path}${configFileName}`

    const sourceStatements = getTSStatements(fullPath)
    const configInterface = sourceStatements.find(node => ts.isInterfaceDeclaration(node)) as ts.InterfaceDeclaration
    if (!configInterface) {
      console.error('Config Interface was not found, ', path)
      continue
    }

    const props = getConfigProperties(configInterface)
    props.forEach(p => {
      if (!skipProperties.includes(p.name)) configPropertiesMap.set(p.name, p)
    })

    configInterfaceMembers = [...configInterfaceMembers, ...configInterface.members]
    statements = [...statements, ...sourceStatements]
    if (i === component.sources.length - 1) generics = configInterface.typeParameters?.map(t => t.name.escapedText) as string[]
  }

  const configProperties = Array.from(configPropertiesMap.values())
  const importStatements = getImportStatements(statements, configInterfaceMembers, generics)

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
