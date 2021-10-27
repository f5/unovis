// Copyright (c) Volterra, Inc. All rights reserved.
import { writeFileSync } from 'fs'
import { exec } from 'child_process'
import ts from 'typescript'

// Utils
import { getImportStatements, getConfigProperties, kebabCase, getTSStatements } from './utils'
import { ComponentInput, ConfigProperty, GenericParameter } from './types'
import { getComponentCode } from './component'

const volterraVisBasePath = '../vis/src'
const configFileName = '/config.ts'
const coreComponentConfigPath = '/core/component'
const xyComponentConfigPath = '/core/xy-component'
const skipProperties = ['width', 'height']
const components: ComponentInput[] = [
  // XY Components
  { name: 'Line', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/line'], dataType: 'Datum[]' },
  { name: 'Area', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/area'], dataType: 'Datum[]' },
  { name: 'Axis', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/axis'], dataType: 'Datum[]', elementSuffix: 'axis' },
  { name: 'Brush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/brush'], dataType: 'Datum[]' },
  { name: 'FreeBrush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/free-brush'], dataType: 'Datum[]' },
  { name: 'Crosshair', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/crosshair'], dataType: 'Datum[]', elementSuffix: 'crosshair' },
  { name: 'GroupedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/grouped-bar'], dataType: 'Datum[]' },
  { name: 'Scatter', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/scatter'], dataType: 'Datum[]' },
  { name: 'StackedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/stacked-bar'], dataType: 'Datum[]' },
  { name: 'Timeline', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/timeline'], dataType: 'Datum[]' },
  { name: 'XYLabels', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/xy-labels'], dataType: 'Datum[]' },

  // Single components
  { name: 'Donut', sources: [coreComponentConfigPath, '/components/donut'], dataType: 'Datum[]' },
  { name: 'TopoJSONMap', kebabCaseName: 'topojson-map', sources: [coreComponentConfigPath, '/components/topojson-map'], dataType: 'any' },
  { name: 'Sankey', sources: [coreComponentConfigPath, '/components/sankey'] },
  { name: 'Graph', sources: [coreComponentConfigPath, '/components/graph'] },

  // Ancillary components
  { name: 'Tooltip', sources: ['/components/tooltip'], dataType: null, elementSuffix: 'tooltip' },

  // Unique cases (you can still generate a wrapper for these components, but most likely it will require some changes)
  // { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], provide: 'VisCoreComponent' },
]

for (const component of components) {
  const configPropertiesMap = new Map<string, ConfigProperty>() // The map of all config properties
  let statements: ts.Statement[] = [] // Statements and ...
  let generics: GenericParameter[] | undefined = [] // Generics

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

  const importStatements = getImportStatements(component.name, statements, [], generics)

  const componentCode = getComponentCode(
    component.name,
    generics,
    importStatements,
    component.dataType,
    component.elementSuffix
  )

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const pathComponentBase = `src/components/${nameKebabCase}`
  const pathComponent = `${pathComponentBase}/index.tsx` // `${pathComponentBase}/${nameKebabCase}.component.tsx`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    exec(`npx eslint ${pathComponent} --fix`)
  })

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
}
