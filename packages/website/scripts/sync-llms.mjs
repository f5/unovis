import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { getComponentList } from '../../shared/integrations/components.ts'

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const coreRoot = join(websiteRoot, '../ts')
const sourceRoot = join(coreRoot, 'src')
const target = join(websiteRoot, 'static/llms/api')
const repositoryRoot = join(websiteRoot, '../..')
const { version } = JSON.parse(await readFile(join(coreRoot, 'package.json'), 'utf8'))
const configFile = ts.readConfigFile(join(coreRoot, 'tsconfig.json'), ts.sys.readFile)
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, coreRoot)
const entryPath = join(sourceRoot, 'index.ts')
const program = ts.createProgram([...config.fileNames, entryPath], { ...config.options, strictNullChecks: true })
const checker = program.getTypeChecker()
const entry = program.getSourceFile(entryPath)
const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(entry))
const resolveSymbol = symbol => symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
const typeDeclaration = symbol => symbol.declarations?.find(node =>
  ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node))
const publicTypes = new Map(exported.map(resolveSymbol).filter(typeDeclaration).map(symbol => [symbol, typeDeclaration(symbol)]))
const components = [
  { name: 'XYContainer', sources: ['/containers/xy-container'], dataType: 'Datum[]', container: true },
  { name: 'SingleContainer', sources: ['/containers/single-container'], dataType: 'Datum', container: true },
  ...getComponentList(),
]
const configs = components.map(component => {
  const file = program.getSourceFile(join(sourceRoot, component.sources.at(-1), 'config.ts'))
  const declaration = file?.statements.find(node => ts.isInterfaceDeclaration(node) && node.name.text === `${component.name}ConfigInterface`)
  if (!declaration) throw new Error(`Missing configuration interface for ${component.name}`)
  return { ...component, declaration, symbol: checker.getSymbolAtLocation(declaration.name) }
})
const configPages = new Map(configs.map(component => [component.symbol, `${component.name}.md`]))
const neededTypes = new Set()

function sourceLink (node) {
  const file = node.getSourceFile()
  const line = file.getLineAndCharacterOfPosition(node.getStart()).line + 1
  return `https://github.com/f5/unovis/blob/main/${relative(repositoryRoot, file.fileName)}#L${line}`
}

function references (nodes) {
  const found = new Set()
  const visit = node => {
    if (ts.isIdentifier(node)) {
      const symbol = checker.getSymbolAtLocation(node)
      const resolved = symbol && resolveSymbol(symbol)
      if (publicTypes.has(resolved)) found.add(resolved)
    }
    ts.forEachChild(node, visit)
  }
  nodes.filter(Boolean).forEach(visit)
  return [...found].sort((a, b) => a.name.localeCompare(b.name))
}

function referenceLinks (symbols, fromType = false) {
  return symbols.map(symbol => {
    const page = configPages.get(symbol)
    if (!page) neededTypes.add(symbol)
    return `- [${symbol.name}](${page ? `${fromType ? '../' : ''}${page}` : `${fromType ? '' : 'types/'}${symbol.name}.md`})`
  })
}

function description (symbol) {
  return ts.displayPartsToString(symbol.getDocumentationComment(checker))
}

await mkdir(join(target, 'types'), { recursive: true })
const generated = new Set()
for (const component of configs) {
  const { declaration, name, dataType, container, isStandAlone } = component
  const properties = checker.getPropertiesOfType(checker.getTypeAtLocation(declaration))
  if (!properties.length) throw new Error(`No configuration properties found for ${name}`)
  const related = references([
    ...(declaration.typeParameters ?? []),
    ...properties.flatMap(property => property.declarations?.map(node => node.type) ?? []),
  ]).filter(symbol => symbol !== component.symbol)
  const propertySections = properties.map(property => {
    const node = property.valueDeclaration ?? property.declarations[0]
    const type = checker.typeToString(checker.getTypeOfSymbolAtLocation(property, declaration), declaration,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope)
    return [
      `## ${property.name}`,
      '',
      '```ts',
      `${property.name}${property.flags & ts.SymbolFlags.Optional ? '?' : ''}: ${type}`,
      '```',
      '',
      description(property),
      '',
      `[Declaration](${sourceLink(node)})`,
    ].join('\n')
  })
  const content = [
    `# ${name} configuration`,
    '',
    `Generated from the TypeScript core for Unovis ${version}. Includes inherited properties; edit the core types and regenerate instead of editing this file.`,
    '',
    `[Core declaration](${sourceLink(declaration)}) · [API index](index.md) · [Framework bindings](../frameworks.md)`,
    '',
    container
      ? 'Container configuration: declarative wrappers compose visualization children; vanilla TypeScript passes component instances in the configuration.'
      : `Placement: ${isStandAlone
        ? 'standalone (no container)'
        : component.sources.includes('/core/xy-component')
          ? 'XYContainer'
          : 'SingleContainer or ancillary component; see the component guide'}.`,
    '',
    dataType
      ? `Data shape: \`${dataType}\`. Data binding is separate from core configuration: use a wrapper's \`data\` binding, ` +
      'or core `setData` / container constructor data. Generic type parameters represent your records.'
      : 'This component is configured without a separate data binding.',
    '',
    'Types below are core configuration types, not MCP tool schemas. Read accessor descriptions: some callbacks receive a datum, others an entire series or a graph node.',
    '',
    '## Related types',
    '',
    ...referenceLinks(related),
    '',
    ...propertySections.flatMap(section => [section, '']),
  ].join('\n')
  const file = `${name}.md`
  await writeFile(join(target, file), content)
  generated.add(file)
}

const writtenTypes = new Set()
while ([...neededTypes].some(symbol => !writtenTypes.has(symbol))) {
  const symbol = [...neededTypes].find(symbol => !writtenTypes.has(symbol))
  const declaration = publicTypes.get(symbol)
  writtenTypes.add(symbol)
  const related = references([declaration]).filter(reference => reference !== symbol)
  const content = [
    `# ${symbol.name}`,
    '',
    `Generated from Unovis ${version}. [Source](${sourceLink(declaration)}) · [API index](../index.md)`,
    '',
    description(symbol),
    '',
    '```ts',
    declaration.getText(),
    '```',
    '',
    '## Related types',
    '',
    ...referenceLinks(related, true),
    '',
  ].join('\n')
  const file = `types/${symbol.name}.md`
  await writeFile(join(target, file), content)
  generated.add(file)
}

await writeFile(join(target, 'index.md'), [
  '# Unovis API reference',
  '',
  `Generated from Unovis ${version} core configuration interfaces and the shared framework component registry.`,
  '',
  'Choose the component below for its exact property names, types, inherited configuration, documented defaults, and linked enum/accessor definitions. ' +
    'These are browser-library APIs; MCP tool inputs are a separate, narrower schema.',
  '',
  '[Library fundamentals](../fundamentals.md) · [Framework bindings](../frameworks.md) · [MCP tools](../../docs/mcp/tools.md)',
  '',
  '## Containers and components',
  '',
  ...configs.map(component => `- [${component.name}](${component.name}.md)`),
  '',
  '## Supporting public types',
  '',
  ...[...writtenTypes].sort((a, b) => a.name.localeCompare(b.name)).map(symbol => `- [${symbol.name}](types/${symbol.name}.md)`),
  '',
].join('\n'))
generated.add('index.md')

for (const directory of ['', 'types']) {
  for (const file of await readdir(join(target, directory))) {
    const path = directory ? `${directory}/${file}` : file
    if (file.endsWith('.md') && !generated.has(path)) await rm(join(target, path))
  }
}
console.error(`✓ generated ${configs.length} component/container references and ${writtenTypes.size} supporting types for /llms.txt`)
