// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock, { Props as CodeblockProps } from '@theme/CodeBlock'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { data, DataRecord } from '../utils/time-series'
import { parseProps } from '../utils/props-helper'

export const XYDocTabs = ({ name, componentProps, showContext }): JSX.Element => {
  const codeType = (ext: string): Partial<CodeblockProps> => ({
    language: ext,
    title: showContext && `component.${ext}`,
  })
  const { angularProps, reactProps, typescriptProps, contextProps } = parseProps(componentProps, showContext)
  return (
    <Tabs groupId="framework">
      <TabItem value="react" label="React">
        <CodeBlock {...codeType('tsx')}>
          {showContext
            ? ['function Component(props) {',
              '  const data: DataRecord[] = props.data',
              ...contextProps.map(p => `  const ${p}`),
              '  return (',
              '    <VisXYContainer data={data}>',
              `      <Vis${name} ${reactProps}/>`,
              '    </VisXYContainer>',
              '  );',
              '}',
            ].join('\n') : `<Vis${name} ${reactProps}/>`}
        </CodeBlock>
      </TabItem>
      <TabItem value="angular" label="Angular">
        {showContext &&
          <CodeBlock language="ts" title="component.ts">
            {['@Input() dataArray: DataRecord[]',
              ...contextProps].join('\n')}
          </CodeBlock>}
        <CodeBlock {...codeType('html')}>
          {`<vis-${name.toLowerCase()} ${angularProps}></vis-${name.toLowerCase()}>`}
        </CodeBlock>
      </TabItem>
      <TabItem value="typescript" label="TypeScript">
        <CodeBlock {...codeType('ts')}>
          {showContext
            ? ['data: DataRecord[] = getData()',
              ...contextProps,
              '',
              `const component = new ${name}({ ${typescriptProps} }})`,
              '',
              'const config: XYContainerConfigInterface<DataRecord> = {',
              '  components: [component]',
              '}',
              'const chart = new XYContainer(containerNode, config, data)'].join('\n')
            : `const chart = new ${name}({ ${typescriptProps} }})`
          }
        </CodeBlock>
      </TabItem>
    </Tabs>
  )
}

export const XYComponentDoc = ({ name, height, showAxes, className, componentProps }): JSX.Element => {
  return (
    <BrowserOnly>
      {() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { VisXYContainer, [`Vis${name}`]: Component, VisAxis } = require('@volterra/vis-react')

        return (
          <VisXYContainer data={data} height={height} className={className}>
            <Component {...componentProps}/>
            {!!showAxes && (<><VisAxis type="x" /><VisAxis type="y" /></>)}
          </VisXYContainer>
        )
      }}
    </BrowserOnly>
  )
}

export const XYWrapper = (props): JSX.Element => {
  const { name, className, height, showAxes, showContext, excludeTabs, excludeGraph, ...rest } = props
  const componentProps = {
    x: (d: DataRecord) => d.x,
    y: (d: DataRecord) => d.y,
    ...rest,
  }
  const tabProps = { name, showContext, componentProps }
  const graphProps = { name, height, showAxes, className, componentProps }
  return (
    <>
      {!excludeTabs && <XYDocTabs {...tabProps}/>}
      {!excludeGraph && <XYComponentDoc {...graphProps}/>}
    </>
  )
}
