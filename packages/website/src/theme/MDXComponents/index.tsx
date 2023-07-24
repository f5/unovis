import React from 'react'
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents'
import { DocWrapper } from '@site/src/components/DocWrapper'
import { FrameworkTabs } from '@site/src/components/FrameworkTabs'

console.log(MDXComponents)

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrameworkTabs,
  XYWrapper: (props) => <DocWrapper containerName='XYContainer' {...props}/>,
}
