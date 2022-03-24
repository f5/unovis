// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'
import { FrameworkProps } from '../../utils/props-helper'

export type DocTabsProps = FrameworkProps & {
  hideTabLabels?: boolean; // when true, hides tab labels but keeps tab content
  showContext?: boolean; // shows additional typescript code for more complex functions
}
/* Displays code snippets with framework tabs */
export function XYDocTabs ({ componentStrings, contextProps, hideTabLabels, showContext }: DocTabsProps): JSX.Element {
  console.log(contextProps)
  return (
    <Tabs groupId="framework" className={hideTabLabels ? 'hidden' : ''}>
      <TabItem value="react" label="React">
        <CodeBlock language="jsx" title={showContext && 'component.tsx'}>
          {showContext
            ? [
              'function Component(props) {',
              '  const data: DataRecord[] = props.data',
              ...contextProps.map((p) => `  const ${p.replace(/\n/gm, '\n  ')}`),
              '  return (',
              '    <VisXYContainer data={data}>',
              `      ${componentStrings.react}`,
              '    </VisXYContainer>',
              '  )',
              '};',
            ].join('\n')
            : componentStrings.react}
        </CodeBlock>
      </TabItem>
      <TabItem value="angular" label="Angular">
        {showContext && (
          <CodeBlock language="ts" title="component.ts">
            {['@Input() dataArray: DataRecord[]', ...contextProps].join('\n')}
          </CodeBlock>
        )}
        <CodeBlock language="html" title={showContext && 'template.html'}>
          {showContext
            ? ['<vis-xy-container [data]="dataArray">',
              `  ${componentStrings.angular}`,
              '</vis-xy-container>'].join('\n')
            : componentStrings.angular
          }
        </CodeBlock>
      </TabItem>
      <TabItem value="typescript" label="TypeScript">
        <CodeBlock language="ts" title={showContext && 'component.ts'}>
          {showContext
            ? [
              'const data: DataRecord[] = getData()',
              ...contextProps.map((p) => `const ${p}`),
              '',
              'const config: XYContainerConfigInterface<DataRecord> = {',
              `  ${componentStrings.typescript}`,
              '}',
              'const chart = new XYContainer(containerNode, config, data)',
            ].join('\n')
            : ['const config: XYContainerConfigInterface<DataRecord> = {',
              `  ${componentStrings.typescript}`,
              '}'].join('\n')}
        </CodeBlock>
      </TabItem>
    </Tabs>
  )
}
