import React from 'react'
import { XYContainerConfigInterface } from '@unovis/ts'
import { DataRecord } from '@site/docs/utils/data'
import { XYComponentSnippetConfigInterface } from '@site/src/utils/autogen'

import { DocWrapper, DocWrapperProps } from '@site/src/components/DocWrapper'
import { InputWrapper, DynamicWrapper } from '../interactive'
import { DocComponent } from '../types'
import './custom.css'

type XYWrapperProps = Partial<DocWrapperProps<DataRecord>> & {
  containerProps?: XYContainerConfigInterface<DataRecord>;
  showAxes?: boolean;
}

export const axis = (t: 'x' | 'y', props = {}) => ({ name: 'Axis', type: t, ...props })

const getProps = ({ showAxes, containerProps, components, ...rest }: XYWrapperProps): DocWrapperProps => ({
  components: showAxes ? (components ?? []).concat([axis('x'), axis('y')]) : components,
  containerName: 'XYContainer',
  containerProps: { ...containerProps, data: 'data' },
  ...rest,
})

export const XYWrapper = (props: XYWrapperProps): JSX.Element => <DocWrapper {...getProps(props)}/>
export const XYWrapperWithInput = (props: XYWrapperProps): JSX.Element => <InputWrapper {...getProps(props)}/>
export const DynamicXYWrapper = (props: XYWrapperProps): JSX.Element => <DynamicWrapper {...getProps(props)}/>
