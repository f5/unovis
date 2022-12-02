import { writeFileSync } from 'fs'
import { exec } from 'child_process'
import ts from 'typescript'

// Utils
import { getImportStatements, getConfigProperties, kebabCase, getTSStatements, getTypeName, gatherTypeReferences } from './utils'
import { ComponentInput, ConfigProperty, GenericParameter } from './types'
import { getComponentCode } from './component'

const htmlElements = ['BulletLegend', 'LeafletMap', 'LeafletFlowMap']
const unovisBasePath = '../ts/src'
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
  { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], dataType: 'Datum[]', styles: ['display:block', 'position:relative'] },
  { name: 'LeafletFlowMap', sources: [coreComponentConfigPath, '/components/leaflet-map', '/components/leaflet-flow-map'], dataType: '{ points: PointDatum[]; flows?: FlowDatum[] }', styles: ['display:block', 'position:relative'] },
  { name: 'BulletLegend', sources: ['/components/bullet-legend'], dataType: null, styles: ['display:block'] },
]
const exports: string[] = []

for (const component of components) {
  const requiredProps = new Map<string, string[]>() // maps interface to required props
  const configPropertiesMap = new Map<string, ConfigProperty>() // The map of all config properties
  let statements: ts.Statement[] = [] // Statements and ...
  let configInterfaceMembers: ts.TypeElement[] = [] // config interface members to resolve imports of custom types
  let generics: GenericParameter[] | undefined = [] // Generics

  for (const [i, path] of component.sources.entries()) {
    const fullPath = `${unovisBasePath}${path}${configFileName}`

    const sourceStatements = getTSStatements(fullPath)
    const configInterface = sourceStatements.find(node => ts.isInterfaceDeclaration(node)) as ts.InterfaceDeclaration
    if (!configInterface) {
      console.error('Config Interface was not found, ', path)
      continue
    }

    const interfaceName = getTypeName(configInterface.name)
    requiredProps.set(interfaceName, [])

    const props = getConfigProperties(configInterface)
    props.forEach((p: ConfigProperty) => {
      if (!skipProperties.includes(p.name) && p.required) {
        configPropertiesMap.set(p.name, p)
        requiredProps.set(interfaceName, [...requiredProps.get(interfaceName), p.name])
        const member = configInterface.members.find(m => (m.name as ts.Identifier)?.escapedText === p.name)
        if (member) {
          configInterfaceMembers = [
            ...configInterfaceMembers,
            member,
          ]
        }
      }
    })

    if (configInterface.heritageClauses) {
      const heritageClauses = Array.from(configInterface.heritageClauses)
      const utilityTypes = heritageClauses.flatMap(hc => hc.types.filter(t => t.typeArguments))
      utilityTypes.forEach(t => {
        const expression = (t.expression as ts.Identifier).escapedText
        const types = Array.from(t.typeArguments)
        if (expression === 'Partial') {
          // If partial, required members from the inherited interface are now optional
          const partialInterfaceName = getTypeName((types.at(0) as ts.TypeReferenceNode).typeName)
          requiredProps.get(partialInterfaceName).forEach(p => {
            configPropertiesMap.delete(p)
          })
        } else if (expression === 'WithOptional') {
          // If WithOptional, only delete the provided property from required props
          const token = (types.at(1) as ts.LiteralTypeNode).literal as ts.LiteralToken
          configPropertiesMap.delete(token.text)
        }
      })
    }

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
    component.styles
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
