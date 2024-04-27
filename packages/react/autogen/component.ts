import { GenericParameter } from '@unovis/shared/integrations/types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'any',
  elementSuffix = 'component',
  isStandAlone = false
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const genericsDefStr = generics
    ? `<${generics?.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
    : ''
  const componentType = `${componentName}${genericsStr}`
  const refType = isStandAlone ? 'HTMLDivElement' : `VisComponentElement<${componentType}>`
  const elementDef = `ref.current as ${refType}`
  const initProps = componentName === 'BulletLegend'
    ? '{ ...props, renderIntoProvidedDomNode: true }'
    : 'props'
  const onDestroy = isStandAlone ? 'c?.destroy()' : `{
    componentRef.current = undefined
    c.destroy()
  }`
  return `// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}

// Utils
import { arePropsEqual } from 'src/utils/react'
${isStandAlone ? '' : '\n// Types\nimport { VisComponentElement } from \'src/types/dom\'\n'}
export type Vis${componentName}Ref${genericsDefStr} = {
    component?: ${componentType};
}

export type Vis${componentName}Props${genericsDefStr} = ${componentName}ConfigInterface${genericsStr} & {${dataType ? `\n  data?: ${dataType};` : ''}
  ref?: Ref<Vis${componentName}Ref${genericsStr}>;${isStandAlone ? '\nclassName?: string;' : ''}
}

export const Vis${componentName}Selectors = ${componentName}.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function Vis${componentName}FC${genericsDefStr} (props: Vis${componentName}Props${genericsStr}, fRef: ForwardedRef<Vis${componentName}Ref${genericsStr}>): JSX.Element {
  const ref = useRef<${refType}>(null)
  const ${isStandAlone ? `[component, setComponent] = useState<${componentType}>()` : `componentRef = useRef<${componentType} | undefined>(undefined)`}

  // On Mount
  useEffect(() => {
    ${(isStandAlone ? [
    `const c = new ${componentType}(${elementDef}, ${initProps}${dataType ? ', props.data' : ''})`,
    'setComponent(c)',
  ] : [`const element = (${elementDef})\n`,
    `const c = new ${componentType}(${initProps})`,
    'componentRef.current = c',
    'element.__component__ = c',
  ]).join('\n  ')}
  
    return () => ${onDestroy}
  }, [])

  // On Props Update
  useEffect(() => {
    ${isStandAlone ? '' : 'const component = componentRef.current'}
    ${dataType ? 'if (props.data) component?.setData(props.data)' : ''}
    component?.${componentName === 'BulletLegend' ? 'update ' : 'setConfig'}(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return ${isStandAlone ? 'component' : 'componentRef.current'} } }), [])
  return <${isStandAlone ? 'div className={props.className}' : `vis-${elementSuffix}`} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const Vis${componentName}: (${genericsDefStr}(props: Vis${componentName}Props${genericsStr}) => JSX.Element | null) = React.memo(React.forwardRef(Vis${componentName}FC), arePropsEqual)
`
}
