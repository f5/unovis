import React from 'react'
import { DocWrapper } from '../base'
import { InputWrapper, DynamicWrapper } from '../interactive'
import { DocComponent, DocWrapperProps } from '../types'
import './custom.css'

const defaultProps: Partial<DocWrapperProps> = {
  containerName: 'XYContainer',
  configKey: 'components',
  dataType: 'DataRecord',
}

type XYWrapperProps = DocWrapperProps & {
  showAxes?: boolean;
}

export const axis = (t: 'x' | 'y', props = {}): DocComponent => ({ name: 'Axis', props: { type: t, ...props } })

const getProps = ({ showAxes, components = [], ...rest }: XYWrapperProps): DocWrapperProps => {
  const axes = showAxes ? ['x', 'y'].map(type => axis(type)) : []
  return { ...defaultProps, components: [...components, ...axes], ...rest }
}

export const XYWrapper = (props: XYWrapperProps): JSX.Element => <DocWrapper {...getProps(props)}/>
export const XYWrapperWithInput = (props: XYWrapperProps): JSX.Element => <InputWrapper {...getProps(props)}/>
export const DynamicXYWrapper = (props: XYWrapperProps): JSX.Element => <DynamicWrapper {...getProps(props)}/>
