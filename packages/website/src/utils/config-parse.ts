import ts from 'typescript'

export type ConfigProperty = {
  name: string;
  type: string;
  doc: string[];
  kind: ts.SyntaxKind;
  required?: boolean;
}


export function getTypeName (type: ts.Node | undefined): string {
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
    case (ts.SyntaxKind.TypeParameter): {
      const t = type as ts.TypeParameterDeclaration
      return `${getTypeName(t.name)} in ${getTypeName(t.constraint)}`
    }
    case (ts.SyntaxKind.MappedType): {
      const t = type as ts.MappedTypeNode
      const propName = getTypeName(t.typeParameter)
      const questionToken = t.questionToken ? '?' : ''
      const propType = getTypeName(t.type)
      return `{\n[${propName}]${questionToken}:${propType}\n}`
    }
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
