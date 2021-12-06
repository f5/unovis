// Copyright (c) Volterra, Inc. All rights reserved.
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
  return `/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type Vis${componentName}Props${genericsDefStr} = ${componentName}ConfigInterface${genericsStr} & { data?: ${dataType} }

// eslint-disable-next-line @typescript-eslint/naming-convention
function Vis${componentName}FC${genericsDefStr} (props: Vis${componentName}Props${genericsStr}): JSX.Element {
  const ref = useRef<VisComponentElement<${componentName}${genericsStr}>>(null)
  const [component] = useState<${componentName}${genericsStr}>(new ${componentName}(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<${componentName}${genericsStr}>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    ${dataType ? 'component?.setData(props.data ?? [])' : ''}
    component?.setConfig(props)
  })

  return <vis-${elementSuffix} ref={ref} />
}
const memoizedComponent = React.memo(Vis${componentName}FC, arePropsEqual)
export const Vis${componentName} = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof ${componentName}.selectors>
Vis${componentName}.selectors = ${componentName}.selectors
`
}
