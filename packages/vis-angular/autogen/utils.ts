// Copyright (c) Volterra, Inc. All rights reserved.
import * as ts from 'typescript'
import { ConfigProperty } from './types'

export function getTypeName (type: ts.Node): string {
  switch (type.kind) {
    case (ts.SyntaxKind.UnionType): return (type as ts.UnionTypeNode).types.map(getTypeName).join(' | ')
    case (ts.SyntaxKind.IntersectionType): return (type as ts.IntersectionTypeNode).types.map(getTypeName).join(' & ')
    case (ts.SyntaxKind.LiteralType): return getTypeName((type as ts.LiteralTypeNode).literal)
    case (ts.SyntaxKind.BooleanKeyword): return 'boolean'
    case (ts.SyntaxKind.NumberKeyword): return 'number'
    case (ts.SyntaxKind.StringKeyword): return 'string'
    case (ts.SyntaxKind.NullKeyword): return 'null'
    case (ts.SyntaxKind.UndefinedKeyword): return 'undefined'
    case (ts.SyntaxKind.AnyKeyword): return 'any'
    case (ts.SyntaxKind.ParenthesizedType): return `(${getTypeName((type as ts.ParenthesizedTypeNode).type)})`
    case (ts.SyntaxKind.FunctionType): {
      const parameters = (type as ts.FunctionTypeNode).parameters
        .map((p: ts.ParameterDeclaration) => {
          const paramName = (p.name as ts.Identifier).escapedText
          const paramType = p.type ? getTypeName(p.type) : undefined
          const isRest = p.dotDotDotToken
          return isRest ? '...rest' : (paramName + (paramType ? `: ${paramType}` : ''))
        })
        .join(', ')

      const returnType = getTypeName((type as ts.FunctionTypeNode).type)

      return `(${parameters}) => ${returnType}`
    }
    case (ts.SyntaxKind.TypeReference): {
      const name = ((type as ts.TypeReferenceNode).typeName as ts.Identifier).escapedText
      const generics = (type as ts.TypeReferenceNode).typeArguments?.map(getTypeName).join(', ')
      return name + (generics ? `<${generics}>` : '')
    }
    case (ts.SyntaxKind.ArrayType): return `${getTypeName((type as ts.ArrayTypeNode).elementType)}[]`
    case (ts.SyntaxKind.TupleType): return `[${(type as ts.TupleTypeNode).elements.map(getTypeName).join(', ')}]`
    default: {
      console.error('Couldn\'t extract type name. Consider updating the parser code. ', type)
      return 'any'
    }
  }
}

export function getConfigProperties (configInterface: ts.InterfaceDeclaration): ConfigProperty[] {
  const properties = configInterface.members.map((node: any) => {
    const name = node.name.escapedText
    const type = getTypeName(node.type)
    const doc = node.jsDoc?.map(doc => doc.comment)
    const kind: ts.SyntaxKind = node.kind

    return { name, type, doc, kind }
  })

  return properties
}

export function getImports (types: ts.Node[] | ts.NodeArray<ts.Node>, collected = new Set<string>()): string[] {
  for (const type of types) {
    switch (type.kind) {
      case (ts.SyntaxKind.TypeReference): {
        const t = (type as ts.TypeReferenceNode)
        collected.add((t.typeName as ts.Identifier).escapedText as string)
        if (t.typeArguments) getImports(t.typeArguments, collected)
        break
      }
      case (ts.SyntaxKind.ParenthesizedType): {
        getImports([(type as ts.ParenthesizedTypeNode).type], collected)
        break
      }
      case (ts.SyntaxKind.FunctionType): {
        getImports((type as ts.FunctionTypeNode).parameters.map(p => p.type).filter(t => t), collected)
        getImports([(type as ts.FunctionTypeNode).type], collected)
        break
      }
      case (ts.SyntaxKind.TupleType):
        getImports((type as ts.TupleTypeNode).elements)
        break
      case (ts.SyntaxKind.UnionType):
        getImports((type as ts.UnionTypeNode).types, collected)
        break
      case (ts.SyntaxKind.IntersectionType):
        getImports((type as ts.IntersectionTypeNode).types, collected)
        break
      case (ts.SyntaxKind.ArrayType):
        getImports([(type as ts.ArrayTypeNode).elementType], collected)
        break
      default:
    }
  }

  return Array.from(collected)
}

export function getImportStatements (statements, configInterface, generics: string[] = []): { source: string; elements: string[] }[] {
  const importDeclarations: any[] = statements.filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
  const importSources = {}
  for (const importDec of importDeclarations) {
    for (const importEl of importDec.importClause.namedBindings.elements) {
      let importSource: string = importDec.moduleSpecifier.text
      if (!importSource || importSource.startsWith('./') || importSource.startsWith('core/') ||
        importSource.startsWith('types/') || importSource.startsWith('utils/') || importSource.startsWith('components/') ||
        importSource.startsWith('styles/') || importSource.startsWith('data-models/') || importSource.startsWith('data/')
      ) importSource = '@volterra/vis'

      importSources[importEl.name.escapedText] = importSource
    }
  }

  const imports = getImports(configInterface.members.map(node => node.type))
    .filter(name => !generics.includes(name)) // Filter out generics

  const importStatements: { source: string; elements: string[] }[] = []
  for (const name of imports) {
    const importSource: string = importSources[name]
    if (!importSource) {
      console.error(`Can't find import source for: ${name}`)
      continue
    }

    const statement = importStatements.find(s => s.source === importSource)
    if (!statement) importStatements.push({ source: importSource, elements: [name] })
    else statement.elements.push(name)
  }

  return importStatements
}

export function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}
