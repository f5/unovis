import React from 'react'

import { FrameworkTabs } from '../../components/framework-tabs'
import { getAngularStrings, getReactStrings, getSvelteStrings, getTypescriptStrings } from '../../utils/code'
import { parseProps } from '../../utils/parser'
import { DocTabsProps, ContextLevel } from '../types'

/* Displays code snippets with framework tabs */
export function DocFrameworkTabs ({
  components,
  container,
  context,
  dataType,
  declarations = {},
  hideTabLabels,
  imports,
  mainComponent,
  showData,
}: DocTabsProps): JSX.Element {
  const children = !context || context === ContextLevel.Minimal
    ? [components.find(c => c.name === mainComponent)]
    : components

  if (showData) {
    declarations.data = `data: ${dataType.includes(',') ? `${dataType.split(/(?=[A-Z])/)[0]}Data` : `${dataType}[]`}`
  }

  const importedProps = imports ? Object.values(imports).flatMap(i => i) : []
  const tabConfig = {
    container: context && context !== ContextLevel.Minimal && parseProps(container, dataType, importedProps, declarations),
    components: children?.map(c => parseProps(c, dataType, importedProps, declarations)),
    dataType: dataType,
    declarations: context && context !== ContextLevel.Container ? declarations : {},
    importString: imports && `${Object.keys(imports).map(i => `import { ${imports[i].join(', ')} } from '${i}'`).join('\n')}\n`,
  }

  return (
    <FrameworkTabs
      angular={getAngularStrings(tabConfig, importedProps, context === ContextLevel.Minimal)}
      react={getReactStrings(tabConfig)}
      svelte={getSvelteStrings(tabConfig)}
      typescript={getTypescriptStrings(tabConfig, mainComponent && context !== ContextLevel.Container && mainComponent)}
      hideTabLabels={hideTabLabels}
      showTitles={context !== undefined}
    />
  )
}
