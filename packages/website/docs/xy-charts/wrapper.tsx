import React from 'react'
import { DocWrapper, DocWrapperProps, DynamicWrapper, InputWrapper } from '../wrappers'
import { DocComponent } from '../wrappers/base'

const defaultProps: Partial<DocWrapperProps> = {
  containerName: 'XYContainer',
  configKey: 'components',
  dataType: 'DataRecord',
}

type XYWrapperProps = DocWrapperProps & {
  showAxes?: boolean;
}

export const axis = (t: 'x' | 'y'): DocComponent => ({ name: 'Axis', props: { type: t }, key: `${t}Axis` })

const getProps = ({ showAxes, ...rest }: XYWrapperProps): DocWrapperProps => {
  if (showAxes) {
    rest.components?.push(axis('x'), axis('y'))
  }
  return { ...defaultProps, ...rest }
}

export const XYWrapper = (props: XYWrapperProps): JSX.Element => <DocWrapper {...getProps(props)}/>
export const XYWrapperWithInput = (props: XYWrapperProps): JSX.Element => <InputWrapper {...getProps(props)}/>
export const DynamicXYWrapper = (props: XYWrapperProps): JSX.Element => <DynamicWrapper {...getProps(props)}/>
