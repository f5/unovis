// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock, { Props as CodeblockProps } from '@theme/CodeBlock'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { generateDataRecords, DataRecord } from '../utils/time-series'
import { parseProps } from '../utils/props-helper'

export const XYWrapper = (props): JSX.Element => {
  const {
    name,
    data,
    className,
    height,
    showAxes,
    showContext,
    excludeTabs,
    excludeGraph,
    ...rest
  } = props
  const componentProps = {
    x: (d: DataRecord) => d.x,
    y: (d: DataRecord) => d.y,
    ...rest,
  }
  const tabProps = { name, showContext, componentProps }
  const graphProps = {
    name,
    data,
    height,
    showAxes,
    className,
    componentProps,
  }
  return (
    <>
      {!excludeTabs && <XYDocTabs {...tabProps} />}
      {!excludeGraph && <XYComponentDoc {...graphProps} />}
    </>
  )
}

export const XYDocTabs = ({
  name,
  componentProps,
  showContext,
}): JSX.Element => {
  const codeType = (ext: string): Partial<CodeblockProps> => ({
    language: ext,
    title: showContext && `component.${ext}`,
  })
  const { componentStrings, contextProps } =
    parseProps(name, componentProps, showContext)

  return (
    <Tabs groupId="framework">
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
          {componentStrings.angular}
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
              '  components: [component]',
              '}',
              'const chart = new XYContainer(containerNode, config, data)',
            ].join('\n')
            : componentStrings.typescript}
        </CodeBlock>
      </TabItem>
    </Tabs>
  )
}

export const XYComponentDoc = ({
  data,
  name,
  height,
  showAxes,
  className,
  componentProps,
}): JSX.Element => {
  return (
    <BrowserOnly>
      {() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { VisXYContainer, [`Vis${name}`]: Component, VisAxis } = require('@volterra/vis-react')
        return (
          <VisXYContainer
            data={data ?? generateDataRecords(10)}
            height={height ?? 150}
            className={className}
          >
            <Component {...componentProps} />
            {!!showAxes && (
              <>
                <VisAxis type="x"/>
                <VisAxis type="y" />
              </>
            )}
          </VisXYContainer>
        )
      }}
    </BrowserOnly>
  )
}

export const XYWrapperWithInput = (props): JSX.Element => {
  const { property, type, defaultValue, fn, inputProps, ...rest } = props
  const [attr, setAttr] = React.useState(defaultValue || true)

  return (
    <div>
      <label style={{ float: 'right', margin: '0.5em' }}>
        <b style={{ marginRight: '1.5em' }}>Preview {property}</b>
        <input
          style={{ marginTop: '1.5em' }}
          type={type}
          value={attr}
          onChange={(e) => {
            if (type === 'number' || type === 'range') {
              setAttr(Number(e.target.value))
            } else if (type === 'checkbox') {
              setAttr(!attr)
            } else {
              setAttr(e.target.value)
            }
          }}
          {...inputProps}
          checked={attr}
        />
      </label>
      <XYWrapper {...{ [property]: attr, ...rest }} />
    </div>
  )
}

export const XYWrapperWithMenu = (props): JSX.Element => {
  const { options, attr, ...rest } = props
  return (
    <Tabs groupId="testing" className="prop-preview-menu">
      {options.map((o) => (
        <TabItem key={o} value={o} label={o}>
          <XYWrapper {...{ [attr]: o, ...rest }} />
        </TabItem>
      ))}
    </Tabs>
  )
}
