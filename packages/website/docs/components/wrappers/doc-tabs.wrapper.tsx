// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'
import { FrameworkProps } from '../../utils/props-helper'

export enum ContextLevel {
  Full='full', // show typescript declarations for all components in doc
  Minimal='minimal', // exclude function and container decelarations, keep other ts lines
}

export type DocTabsProps = FrameworkProps & {
  hideTabLabels?: boolean; // when true, hides tab labels but keeps tab content
  showContext?: ContextLevel; // shows additional typescript code for more complex functions
}

type TabProps = {
  component: string;
  contextProps: string[];
  contextLevel: ContextLevel;
}

export function ReactWrapper ({ component, contextProps, contextLevel }: TabProps): JSX.Element {
  const codeContent = (): string => {
    switch (contextLevel) {
      case ContextLevel.Full:
        return [
          'function Component(props) {',
          ...['const data: DataRecord[] = props.data', ...contextProps.map(p => `${p.replace(/\n/gm, '\n  ')}`)].map(d => `  ${d}`),
          '\n  return (',
          '    <VisXYContainer data={data}>',
          `      ${component}`,
          '    </VisXYContainer>',
          '  )',
          '}'].join('\n')
      case ContextLevel.Minimal:
        return [contextProps.join('\n'), 'return (', `  ${component}`, ')'].join('\n')
      default:
        return component
    }
  }
  return (
    <CodeBlock language="jsx" title={contextLevel && 'component.tsx'}>
      {codeContent()}
    </CodeBlock>
  )
}

export function AngularWrapper ({ component, contextProps, contextLevel }: TabProps): JSX.Element {
  if (contextLevel === ContextLevel.Full) {
    contextProps = ['@Input() dataArray: DataRecord[]', ...contextProps]
    component = ['<vis-xy-container [data]="dataArray">', `  ${component}`, '</vis-xy-container>'].join('\n')
  }
  return (
    <>
      {contextLevel && (
        <CodeBlock language="ts" title={contextLevel && 'component.ts'}>
          {contextProps.join('\n')}
        </CodeBlock>
      )}
      <CodeBlock language="html" title={contextLevel && 'template.html'}>
        {component}
      </CodeBlock>
    </>
  )
}

export function TypescriptWrapper ({ component, contextProps, contextLevel }: TabProps): JSX.Element {
  const context = contextProps?.map((p) => `const ${p}`).join('\n')
  component = `const config: XYContainerConfigInterface<DataRecord> = {\n  ${component}\n}`
  const codeContent = (): string => {
    switch (contextLevel) {
      case ContextLevel.Full:
        return ['const data = getData()', context, component, 'const chart = new XYContainer(containerNode, config, data)'].join('\n')
      case ContextLevel.Minimal:
        return [context, component].join('\n')
      default:
        return component
    }
  }
  return (
    <CodeBlock language="ts" title={contextLevel && 'component.ts'}>
      {codeContent()}
    </CodeBlock>
  )
}

/* Displays code snippets with framework tabs */
export function XYDocTabs ({ componentStrings, contextProps, hideTabLabels, showContext }: DocTabsProps): JSX.Element {
  return (
    <Tabs groupId="framework" className={hideTabLabels ? 'hidden' : ''}>
      <TabItem value="react" label="React">
        <ReactWrapper component={componentStrings.react} contextLevel={showContext} contextProps={contextProps}/>
      </TabItem>
      <TabItem value="angular" label="Angular">
        <AngularWrapper component={componentStrings.angular} contextLevel={showContext} contextProps={contextProps}/>
      </TabItem>
      <TabItem value="typescript" label="TypeScript">
        <TypescriptWrapper component={componentStrings.typescript} contextLevel={showContext} contextProps={contextProps}/>
      </TabItem>
    </Tabs>
  )
}
