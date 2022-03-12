// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock, { Props as CodeblockProps } from '@theme/CodeBlock'
import { FrameworkProps } from '../../utils/props-helper'

export type DocTabsProps = FrameworkProps & {
  hideTabLabels?: boolean; // when true, hides tab labels but keeps tab content
  showContext?: boolean; // shows additional typescript code for more complex functions
}
/* Displays code snippets with framework tabs */
export function XYDocTabs ({ componentStrings, contextProps, hideTabLabels, showContext }: DocTabsProps): JSX.Element {
  const codeType = (ext: string): Partial<CodeblockProps> => ({
    language: ext,
    title: showContext && `component.${ext}`,
  })

  return (
    <Tabs groupId="framework" className={hideTabLabels ? 'hidden' : ''}>
      <TabItem value="react" label="React">
        <CodeBlock {...codeType('tsx')}>
          {showContext
            ? [
              'function Component(props) {',
              '  const data: DataRecord[] = props.data',
              ...contextProps.map((p) => `  const ${p}`),
              '  return (',
              '    <VisXYContainer data={data}>',
              `      ${componentStrings.react}`,
              '    </VisXYContainer>',
              '  );',
              '}',
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
        <CodeBlock {...codeType('html')}>
          {showContext && '<vis-xy-container [data]="dataArray">\n  '}
          {componentStrings.angular}
          {showContext && '\n</vis-xy-container>'}
        </CodeBlock>
      </TabItem>
      <TabItem value="typescript" label="TypeScript">
        <CodeBlock {...codeType('ts')}>
          {showContext
            ? [
              'const data: DataRecord[] = getData()',
              ...contextProps.map((p) => `const ${p}`),
              '',
              componentStrings.typescript,
              '',
              'const config: XYContainerConfigInterface<DataRecord> = {',
              '  components: components',
              '}',
              'const chart = new XYContainer(containerNode, config, data)',
            ].join('\n')
            : componentStrings.typescript}
        </CodeBlock>
      </TabItem>
    </Tabs>
  )
}
