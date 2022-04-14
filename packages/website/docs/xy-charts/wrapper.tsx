
import React from 'react'
import { DocWrapper, DocWrapperProps, DynamicWrapper, InputWrapper } from '../wrappers'

const defaultProps: Partial<DocWrapperProps> = {
  containerName: 'XYContainer',
  configKey: 'components',
  dataType: 'DataRecord',
}

type XYWrapperProps = DocWrapperProps & {
  showAxes?: boolean;
}

const axes = ['x', 'y'].map(t => ({ name: 'Axis', props: { type: t }, key: `${t}Axis` }))

const getProps = ({ showAxes, ...rest }: XYWrapperProps): DocWrapperProps => {
  const props = { ...defaultProps, ...rest }
  return showAxes ? { ...props, componentProps: [...(rest.componentProps ?? []), ...axes] } : props
}

export const XYWrapper = (props: XYWrapperProps): JSX.Element => <DocWrapper {...getProps(props)}/>
export const XYWrapperWithInput = (props: XYWrapperProps): JSX.Element => <InputWrapper {...getProps(props)}/>
export const DynamicXYWrapper = (props: XYWrapperProps): JSX.Element => <DynamicWrapper {...getProps(props)}/>
