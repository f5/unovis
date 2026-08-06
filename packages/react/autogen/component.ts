import { GenericParameter } from '@unovis/shared/integrations/types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'any',
  elementSuffix = 'component',
  isStandAlone = false,
  renderIntoProvidedDomNode = false
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const genericsDefStr = generics
    ? `<${generics?.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
    : ''
  const componentType = `${componentName}${genericsStr}`
  const refType = isStandAlone ? `VisComponentElement<${componentType}, HTMLDivElement>` : `VisComponentElement<${componentType}>`
  const elementDef = `ref.current as ${refType}`
  const initProps = renderIntoProvidedDomNode
    ? '{ ...props, renderIntoProvidedDomNode: true }'
    : 'props'

  // Stand-alone components own their DOM node and render from `setConfig` themselves, so they don't
  // have a container to ask. Container-hosted ones do: `setConfig` only stores the new config.
  const containerRenderImport = isStandAlone
    ? ''
    : "\nimport { useContainerRenderRequest } from 'src/utils/container'"
  const containerRenderHook = isStandAlone
    ? ''
    : `
  const requestContainerRender = useContainerRenderRequest()
  const prevPropsRef = useRef<Vis${componentName}Props${genericsStr} | undefined>(undefined)`
  const containerRenderRequest = isStandAlone
    ? ''
    : `
    // A config change has to drive the render itself. The container re-renders only when its own props
    // change, which doesn't happen when the new config reaches this component through React context or
    // a parent's state. Skipped on the first run: the container renders on mount.
    if (prevPropsRef.current !== undefined && !arePropsEqual(prevPropsRef.current, props)) requestContainerRender()
    prevPropsRef.current = props`

  return `// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}

// Utils
import { arePropsEqual } from 'src/utils/react'${containerRenderImport}

// Types
import { VisComponentElement } from 'src/types/dom'

export type Vis${componentName}Ref${genericsDefStr} = {
    component?: ${componentType};
}

export type Vis${componentName}Props${genericsDefStr} = ${componentName}ConfigInterface${genericsStr} & {${dataType ? `\n  data?: ${dataType};` : ''}
  ref?: Ref<Vis${componentName}Ref${genericsStr}>;${isStandAlone ? '\nclassName?: string;' : ''}
}

export const Vis${componentName}Selectors = ${componentName}.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function Vis${componentName}FC${genericsDefStr} (props: Vis${componentName}Props${genericsStr}, fRef: ForwardedRef<Vis${componentName}Ref${genericsStr}>): ReactElement {
  const ref = useRef<${refType}>(null)
  const componentRef = useRef<${componentType} | undefined>(undefined)${containerRenderHook}

  // On Mount
  useEffect(() => {
    const element = (${elementDef})

    const c = ${isStandAlone ? `new ${componentType}(${elementDef}, ${initProps}${dataType ? ', props.data' : ''})` : `new ${componentType}(${initProps})`}
    componentRef.current = c
    element.__component__ = c

    return () => {
      componentRef.current = undefined
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const component = componentRef.current
    ${dataType ? 'if (props.data) component?.setData(props.data)' : ''}
    component?.setConfig(props)${containerRenderRequest}
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <${isStandAlone ? 'div className={props.className}' : `vis-${elementSuffix}`} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const Vis${componentName}: (${genericsDefStr}(props: Vis${componentName}Props${genericsStr}) => JSX.Element | null) = React.memo(React.forwardRef(Vis${componentName}FC), arePropsEqual)
`
}
