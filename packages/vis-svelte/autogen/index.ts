import { writeFileSync } from 'fs'
import { exec } from 'child_process'
import ts from 'typescript'

// Utils
import { getImportStatements, getConfigProperties, kebabCase, getTSStatements } from './utils'
import { ComponentInput, ConfigProperty, GenericParameter } from './types'
import { getComponentCode } from './component'

const htmlElements = ['BulletLegend', 'LeafletMap', 'LeafletFlowMap']
const containsExports = ['LeafletMap', 'LeafletFlowMap', 'TopoJSONMap', 'Graph']
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
  { name: 'TopoJSONMap', kebabCaseName: 'topojson-map', sources: [coreComponentConfigPath, '/components/topojson-map'], dataType: '{areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]}' },
  { name: 'Sankey', sources: [coreComponentConfigPath, '/components/sankey'], dataType: '{ nodes: N[]; links?: L[] }' },
  { name: 'Graph', sources: [coreComponentConfigPath, '/components/graph'], dataType: '{ nodes: N[]; links?: L[] }' },
  { name: 'ChordDiagram', sources: [coreComponentConfigPath, '/components/chord-diagram'], dataType: '{ nodes: N[]; links?: L[] }' },

  // Ancillary components
  { name: 'Tooltip', sources: ['/components/tooltip'], dataType: null, elementSuffix: 'tooltip' },

  // Unique cases (you can still generate a wrapper for these components, but most likely it will require some changes)
  { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], dataType: 'Datum[]' },
  // { name: 'LeafletFlowMap', sources: [coreComponentConfigPath, '/components/leaflet-flow-map'], dataType: '{ points: PointDatum[]; flows?: FlowDatum[] }' },
  { name: 'BulletLegend', sources: ['/components/bullet-legend'], dataType: null },
]
const exports: string[] = []

for (const component of components) {
  const configPropertiesMap = new Map<string, ConfigProperty>() // The map of all config properties
  let statements: ts.Statement[] = [] // Statements and ...
  let configInterfaceMembers: ts.TypeElement[] = [] // config interface members to resolve imports of custom types
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
    props.forEach((p: ConfigProperty) => {
      if (!skipProperties.includes(p.name) && p.required) {
        configPropertiesMap.set(p.name, p)
        const member = configInterface.members.find(m => (m.name as ts.Identifier)?.escapedText === p.name)
        if (member) {
          configInterfaceMembers = [
            ...configInterfaceMembers,
            member,
          ]
        }
      }
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

  const importStatements = getImportStatements(component.name, statements, configInterfaceMembers, generics)
  const configProperties = Array.from(configPropertiesMap.values())
  const isStandAlone = htmlElements.includes(component.name)

  const componentCode = getComponentCode(
    component.name,
    generics,
    configProperties,
    importStatements,
    component.dataType,
    isStandAlone ? kebabCase(component.name) : component.elementSuffix,
    isStandAlone,
    containsExports.includes(component.name)
  )

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const file = `${nameKebabCase}.svelte`
  const path = `${isStandAlone ? 'html-' : ''}components/${nameKebabCase}`
  const pathComponentBase = `src/${path}`
  const pathComponent = `${pathComponentBase}/${file}`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    exec(`npx eslint ${pathComponent} --fix`)
  })

  exports.push(`export { default as Vis${component.name} } from './${path}/${file}'`)

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
}

writeFileSync('src/components.ts', exports.join('\n'))
