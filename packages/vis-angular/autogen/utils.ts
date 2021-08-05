// Copyright (c) Volterra, Inc. All rights reserved.import { readFileSync } from 'fs'
import { readFileSync } from 'fs'
import * as ts from 'typescript'
import { ConfigProperty, GenericParameter } from './types'

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
    case (ts.SyntaxKind.VoidKeyword): return 'void'
    case (ts.SyntaxKind.UnknownKeyword): return 'unknown'
    case (ts.SyntaxKind.Parameter): {
      const p = type as ts.ParameterDeclaration
      const paramName = getTypeName(p.name)
      const paramType = p.type ? getTypeName(p.type) : undefined
      const isRest = p.dotDotDotToken
      return isRest
        ? '...rest'
        : (`${paramName}${p.questionToken ? '?' : ''}${paramType ? `: ${paramType}` : ''}`)
    }
    case (ts.SyntaxKind.ObjectBindingPattern): return `{ ${(type as ts.BindingPattern).elements.map(getTypeName).join(', ')} }`
    case (ts.SyntaxKind.BindingElement): return getTypeName((type as ts.BindingElement).name)
    case (ts.SyntaxKind.Identifier): return (type as ts.Identifier).escapedText as string
    case (ts.SyntaxKind.QualifiedName): return `${getTypeName((type as ts.QualifiedName).left)}.${getTypeName((type as ts.QualifiedName).right)}`
    case (ts.SyntaxKind.TypeLiteral): return `{\n${(type as ts.TypeLiteralNode).members.map(getTypeName).join('\n')}\n}`
    case (ts.SyntaxKind.PropertySignature): {
      const t = type as ts.IndexSignatureDeclaration
      const propName = (t.name as ts.Identifier).escapedText
      const propType = getTypeName(t.type)
      return `${propName}${t.questionToken ? '?' : ''}: ${propType};`
    }
    case (ts.SyntaxKind.IndexSignature): {
      const parameters = (type as ts.IndexSignatureDeclaration).parameters
        .map((p: ts.ParameterDeclaration) => {
          const paramName = (p.name as ts.Identifier).escapedText
          const paramType = p.type ? getTypeName(p.type) : undefined
          return `${paramName}${p.questionToken ? '?' : ''}${paramType ? `: ${paramType}` : ''}`
        })
        .join(', ')

      const returnType = getTypeName((type as ts.FunctionTypeNode).type)

      return `[${parameters}]: ${returnType}`
    }
    case (ts.SyntaxKind.ParenthesizedType): return `(${getTypeName((type as ts.ParenthesizedTypeNode).type)})`
    case (ts.SyntaxKind.FunctionType): {
      const parameters = (type as ts.FunctionTypeNode).parameters
        .map(getTypeName)
        .join(', ')

      const returnType = getTypeName((type as ts.FunctionTypeNode).type)

      return `(${parameters}) => ${returnType}`
    }
    case (ts.SyntaxKind.TypeReference): {
      const name = getTypeName((type as ts.TypeReferenceNode).typeName)
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

export function gatherTypeReferences (types: ts.Node[] | ts.NodeArray<ts.Node>, collected = new Set<string>()): string[] {
  for (const type of types) {
    if (!type) continue
    switch (type.kind) {
      case (ts.SyntaxKind.Identifier): {
        collected.add((type as ts.Identifier).escapedText as string)
        break
      }
      case (ts.SyntaxKind.QualifiedName): {
        gatherTypeReferences([(type as ts.QualifiedName).left], collected)
        break
      }
      case (ts.SyntaxKind.TypeReference): {
        const t = (type as ts.TypeReferenceNode)
        gatherTypeReferences([(type as ts.TypeReferenceNode).typeName], collected)
        if (t.typeArguments) gatherTypeReferences(t.typeArguments, collected)
        break
      }
      case (ts.SyntaxKind.ParenthesizedType): {
        gatherTypeReferences([(type as ts.ParenthesizedTypeNode).type], collected)
        break
      }
      case (ts.SyntaxKind.FunctionType): {
        gatherTypeReferences((type as ts.FunctionTypeNode).parameters.map(p => p.type).filter(t => t), collected)
        gatherTypeReferences([(type as ts.FunctionTypeNode).type], collected)
        break
      }
      case (ts.SyntaxKind.TupleType):
        gatherTypeReferences((type as ts.TupleTypeNode).elements)
        break
      case (ts.SyntaxKind.UnionType):
        gatherTypeReferences((type as ts.UnionTypeNode).types, collected)
        break
      case (ts.SyntaxKind.IntersectionType):
        gatherTypeReferences((type as ts.IntersectionTypeNode).types, collected)
        break
      case (ts.SyntaxKind.ArrayType):
        gatherTypeReferences([(type as ts.ArrayTypeNode).elementType], collected)
        break
      case (ts.SyntaxKind.TypeLiteral): {
        gatherTypeReferences((type as ts.TypeLiteralNode).members, collected)
        break
      }
      case (ts.SyntaxKind.PropertySignature): {
        gatherTypeReferences([(type as ts.IndexSignatureDeclaration).type], collected)
        break
      }
      case (ts.SyntaxKind.IndexSignature): {
        const types = (type as ts.IndexSignatureDeclaration).parameters
          .map((p: ts.ParameterDeclaration) => p.type)
          .filter(t => t)
        gatherTypeReferences(types, collected)
        gatherTypeReferences([(type as ts.IndexSignatureDeclaration).type], collected)
        break
      }
      default:
    }
  }

  return Array.from(collected)
}

export function getImportStatements (
  componentName: string,
  statements: ts.Statement[],
  configInterfaceMembers: ts.TypeElement[],
  generics: GenericParameter[] = []
): { source: string; elements: string[] }[] {
  const importSources = {}

  // We assume that all extend types in generics come from volterra/vis
  const genericExtends = generics.map(g => g.extends).filter(g => g)
  const componentTypes = [componentName, `${componentName}ConfigInterface`]
  for (const typeName of [...componentTypes, ...genericExtends]) {
    importSources[typeName] = '@volterra/vis'
  }

  const importDeclarations: any[] = statements.filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
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

  const genericNames = generics.map(g => g.name)
  const typeList = gatherTypeReferences(configInterfaceMembers.map(node => (node as ts.IndexSignatureDeclaration).type))
    .filter(name => !genericNames.includes(name)) // Filter out generics

  const importStatements: { source: string; elements: string[] }[] = []
  for (const name of Array.from(new Set([...componentTypes, ...genericExtends, ...typeList]))) {
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

export function getTSStatements (path: string): ts.NodeArray<ts.Statement> {
  const splitPath = path.split('/')
  const filename = splitPath[splitPath.length - 1]
  const code = readFileSync(path, 'utf8')
  const parsed = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest)

  return parsed.statements
}
export function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}
