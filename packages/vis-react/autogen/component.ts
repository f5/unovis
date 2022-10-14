import { GenericParameter } from './types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'any',
  elementSuffix = 'component'
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const genericsDefStr = generics
    ? `<${generics?.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
    : ''
  return `// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type Vis${componentName}Ref${genericsDefStr} = {
    component?: ${componentName}${genericsStr}
}

export type Vis${componentName}Props${genericsDefStr} = ${componentName}ConfigInterface${genericsStr} & {
  data?: ${dataType};
  ref?: Ref<Vis${componentName}Ref${genericsStr}>
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function Vis${componentName}FC${genericsDefStr} (props: Vis${componentName}Props${genericsStr}, fRef: ForwardedRef<Vis${componentName}Ref${genericsStr}>): JSX.Element {
  const ref = useRef<VisComponentElement<${componentName}${genericsStr}>>(null)
  const [component, setComponent] = useState<${componentName}${genericsStr}>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<${componentName}${genericsStr}>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new ${componentName}${genericsStr}(props)
    setComponent(c)
    element.__component__ = c

    return () => hasAlreadyBeenInitialized && c.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    ${dataType ? 'if (props.data) component?.setData(props.data)' : ''}
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }), [component])
  return <vis-${elementSuffix} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const Vis${componentName}: (${genericsDefStr}(props: Vis${componentName}Props${genericsStr}) => JSX.Element | null) = React.memo(React.forwardRef(Vis${componentName}FC), arePropsEqual)
`
}
