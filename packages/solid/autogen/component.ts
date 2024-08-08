import type { GenericParameter } from '@unovis/shared/integrations/types'

export function getComponentCode(
  componentName: string,
  generics: GenericParameter[] | undefined,
  importStatements: { source: string; elements: string[] }[],
  dataType: string | null = 'any',
  elementSuffix = 'component',
  isStandAlone = false,
  styles?: string[]
): string {
  const genericsStr = generics
    ? `<${generics.map((g) => g.name).join(', ')}>`
    : ''
  const genericsDefStr = generics
    ? `<${generics
        .map(
          (g) =>
            g.name +
            (g.extends ? ` extends ${g.extends}` : '') +
            (g.default ? ` = ${g.default}` : '')
        )
        .join(', ')}>`
    : ''
  const componentType = `${componentName}${genericsStr}`
  const constructorArgs = isStandAlone
    ? `r, ${
        componentName === 'BulletLegend'
          ? '{ ...props, renderIntoProvidedDomNode: true }'
          : 'props'
      }${dataType ? ', props.data!' : ''}`
    : 'props'

  return `// !!! This code was automatically generated. You should not change it !!!
${importStatements
  .map((s) => `import { ${s.elements.join(', ')} } from "${s.source}";`)
  .join('\n')}
import { createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { arePropsEqual } from '../../utils/props'
${
  isStandAlone ? '' : 'import { useVisContainer } from "../../utils/context";\n'
}
export type Vis${componentName}Props${genericsDefStr} = ${componentName}ConfigInterface${genericsStr}${
    dataType ? `& {\n  data?: ${dataType};\n};` : ''
  }

export const Vis${componentName}Selectors = ${componentName}.selectors

export function Vis${componentName}${genericsDefStr}(props: Vis${componentName}Props${genericsStr}) {
  const [component, setComponent] = createSignal<${componentType}>()
   ${isStandAlone ? '' : `const ctx = useVisContainer();`}
  ${
    isStandAlone ? 'const [ref, setRef] = createSignal<HTMLDivElement>()\n' : ''
  }
  onMount(() => {
    ${
      isStandAlone ? 'const r = ref()\n    if(r) ' : ''
    }setComponent(new ${componentType}(${constructorArgs}));
    ${dataType && !isStandAlone ? 'if (props.data) component()?.setData(props.data)' : ''}
    ${isStandAlone ? '' : `ctx.update("${elementSuffix}", component);`}
  })

  onCleanup(() => {
    component()?.destroy()
    ${
      isStandAlone
        ? ''
        : `ctx.destroy("${elementSuffix}"${
            elementSuffix === 'axis' ? ' ,props.type' : ''
          });`
    }
  })

  createEffect(
    on(
      () => ({ ...props }),
      (curr, prev) => {
        if (!arePropsEqual(prev, curr)) {
          component()?.${
            componentName === 'BulletLegend' ? 'update' : 'setConfig'
          }(curr)
          ${isStandAlone ? '' : `ctx.dirty()`}
        }
      },
      {
        defer: true
      }
    )
  )

  ${
    dataType && !isStandAlone
      ? `\n  createEffect(
    on(
      () => props.data,
      (data) => {
        if (data) {
          component()?.setData(data)
          ${isStandAlone ? '' : `ctx.dirty()`}
        }
      },
      {
        defer: true
      }
    )
  );\n`
      : ''
  }

  return <div ${
    componentName === 'BulletLegend' ||
    componentName === 'LeafletMap' ||
    componentName === 'LeafletFlowMap'
      ? ''
      : `data-vis-${elementSuffix}`
  } ${isStandAlone ? `ref={setRef} style={{ ${styles?.join(', ')} }}` : ''} />
}
`
}
