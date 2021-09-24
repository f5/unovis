// Copyright (c) Volterra, Inc. All rights reserved.
import { GenericParameter } from './types'

export function getComponentCode (
  componentName: string,
  generics: GenericParameter[] | undefined,
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'any'
): string {
  const genericsStr = generics ? `<${generics?.map(g => g.name).join(', ')}>` : ''
  const genericsDefStr = generics
    ? `<${generics?.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
    : ''
  return `/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
//import { ${componentName}, ${componentName}ConfigInterface } from '@volterra/vis'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}

export type Vis${componentName}Props${genericsDefStr} = ${componentName}ConfigInterface${genericsStr} & { data?: ${dataType} }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Vis${componentName}${genericsDefStr} (props: Vis${componentName}Props${genericsStr}): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: ${componentName}${genericsStr} }
  const ref = useRef<RefType>(null)
  const [component] = useState<${componentName}${genericsStr}>(new ${componentName}(props))

  // On Mount
  useEffect(() => {
    (ref.current as RefType).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    ${dataType ? 'component?.setData(props.data ?? [])' : ''}
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
`
}
