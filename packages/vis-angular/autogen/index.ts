// Copyright (c) Volterra, Inc. All rights reserved.
import { writeFileSync } from 'fs'
import { exec } from 'child_process'
import ts from 'typescript'

// Utils
import { getImportStatements, getConfigProperties, kebabCase, getTSStatements } from './utils'
import { getComponentCode } from './component'
import { getModuleCode } from './module'
import { ComponentInput, ConfigProperty, GenericParameter } from './types'

const volterraVisBasePath = '../vis/src'
const configFileName = '/config.ts'
const coreComponentConfigPath = '/core/component'
const xyComponentConfigPath = '/core/xy-component'
const skipProperties = ['width', 'height']
const components: ComponentInput[] = [
  // XY Components
  { name: 'Line', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/line'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'Area', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/area'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'Axis', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/axis'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'Brush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/brush'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'FreeBrush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/free-brush'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'Crosshair', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/crosshair'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'GroupedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/grouped-bar'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'Scatter', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/scatter'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'StackedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/stacked-bar'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'Timeline', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/timeline'], dataType: 'Datum[]', provide: 'VisXYComponent' },
  { name: 'XYLabels', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/xy-labels'], dataType: 'Datum[]', provide: 'VisXYComponent' },

  // Single components
  { name: 'Donut', sources: [coreComponentConfigPath, '/components/donut'], dataType: 'Datum[]', provide: 'VisCoreComponent' },
  { name: 'TopoJSONMap', kebabCaseName: 'topojson-map', sources: [coreComponentConfigPath, '/components/topojson-map'], dataType: 'any', provide: 'VisCoreComponent' },
  { name: 'Sankey', sources: [coreComponentConfigPath, '/components/sankey'], provide: 'VisCoreComponent' },
  { name: 'Graph', sources: [coreComponentConfigPath, '/components/graph'], provide: 'VisCoreComponent' },

  // Ancillary components
  { name: 'Tooltip', sources: ['/components/tooltip'], dataType: null, provide: 'VisGenericComponent', hasNoRender: true },

  // Unique cases (you can still generate a wrapper for these components, but most likely it will require some changes)
  // { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], provide: 'VisCoreComponent' },
  // { name: 'BulletLegend', sources: ['/components/bullet-legend'], dataType: null, provide: 'VisGenericComponent' },
]

for (const component of components) {
  const configPropertiesMap = new Map<string, ConfigProperty>() // The map of all config properties
  let statements: ts.Statement[] = [] // Statements and ...
  let configInterfaceMembers: ts.TypeElement[] = [] // ... config interface members to resolve imports of custom types
  let generics: GenericParameter[] = [] // Generics

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
    if (i === component.sources.length - 1) {
      generics = configInterface.typeParameters?.map((t: ts.TypeParameterDeclaration) => {
        const name = t.name.escapedText as string
        const constraint = t.constraint as ts.TypeReferenceNode
        const constraintTypeName = (constraint?.typeName as ts.Identifier)?.escapedText as string
        const defaultValue = ((t.default as ts.TypeReferenceNode)?.typeName as ts.Identifier)?.escapedText as string

        return { name, extends: constraintTypeName, default: defaultValue }
      })
    }
  }

  const configProperties = Array.from(configPropertiesMap.values())
  const importStatements = getImportStatements(component.name, statements, configInterfaceMembers, generics)

  const componentCode = getComponentCode(
    component.name,
    generics,
    configProperties,
    component.provide,
    importStatements,
    component.dataType,
    component.kebabCaseName,
    component.hasNoRender
  )
  const moduleCode = getModuleCode(component.name, component.kebabCaseName)

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
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
