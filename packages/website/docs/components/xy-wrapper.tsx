// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock, { Props as CodeblockProps } from '@theme/CodeBlock'
import BrowserOnly from '@docusaurus/BrowserOnly'
import Toggle from '@theme/Toggle'

import { DataRecord } from '../utils/time-series'
import { parseProps } from '../utils/props-helper'
import './styles.css'

export const XYDocTabs = ({
  name,
  componentProps,
  hideTabs,
  showContext,
}): JSX.Element => {
  const codeType = (ext: string): Partial<CodeblockProps> => ({
    language: ext,
    title: showContext && `component.${ext}`,
  })
  const { componentStrings, contextProps } =
    parseProps(name, componentProps, showContext)

  return (
    <Tabs groupId="framework" className={hideTabs ? 'hidden' : ''}>
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
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
        const { VisXYContainer, [`Vis${name}`]: Component, VisAxis } = require('@volterra/vis-react')

        return (
          <VisXYContainer
            data={data}
            height={height ?? 150}
            className={className}
          >
            <Component {...componentProps}/>
            {!!showAxes && (
              <>
                <VisAxis type="x" />
                <VisAxis type="y" />
              </>
            )}
          </VisXYContainer>
        )
      }}
    </BrowserOnly>
  )
}

export const XYWrapper = (props): JSX.Element => {
  const {
    name,
    data,
    className,
    height,
    hideTabs,
    showAxes,
    showContext,
    excludeTabs,
    excludeGraph,
    dynamicData,
    ...rest
  } = props
  const componentProps = {
    x: (d: DataRecord) => d.x,
    y: (d: DataRecord) => d.y,
    ...rest,
  }

  const tabProps = { name, showContext, hideTabs, componentProps }
  const graphProps = {
    name,
    height,
    data,
    showAxes,
    className,
    componentProps,
    dynamicData,
  }

  return (
    <>
      {!excludeTabs && <XYDocTabs {...tabProps} />}
      {!excludeGraph && <XYComponentDoc {...graphProps}/>}
    </>
  )
}

export const XYWrapperWithInput = (props): JSX.Element => {
  const { property, type, defaultValue, inputProps, ...rest } = props
  const [attr, setAttr] = React.useState(defaultValue)

  return (
    <div className="input-wrapper">
      <label className={`prop-input-label${rest.excludeTabs ? ' center' : ''}`}>
        preview: <span className="prop-name">{property}</span>
        <input
          type={type}
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

export const DynamicDoc = ({ primaryData, secondaryData, exampleProps, ...rest }): JSX.Element => {
  const [current, setCurrent] = React.useState(secondaryData)
  const anim = React.useRef(null)

  function start (): void {
    const time = current === primaryData ? 2000 : 1200
    anim.current = setTimeout(() => {
      setCurrent(current === primaryData ? secondaryData : primaryData)
    }, time)
  }
  function stop (): void {
    clearInterval(anim.current)
    anim.current = null
  }
  React.useEffect(() => {
    start()
    return () => stop()
  }, [current])

  return (
    <BrowserOnly>
      {() => {
        return (
          <div className="input-wrapper">
            <Toggle className="toggle"
              switchConfig={{ darkIcon: '॥', darkIconStyle: { fontWeight: 'bold', marginLeft: '2px' }, lightIcon: '▶' }}
              checked={anim.current} onChange={() => anim.current ? stop() : start()}/>
            <XYWrapper data={current} {...rest} />
            <XYWrapper hideTabs data={current} {...exampleProps} {...rest }/>
          </div>
        )
      }}
    </BrowserOnly>
  )
}
