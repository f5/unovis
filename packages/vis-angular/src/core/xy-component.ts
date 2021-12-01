// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentCore, XYContainer } from '@volterra/vis'
import { VisCoreComponent } from './core-component'

export class VisXYComponent extends VisCoreComponent {
  component: XYComponentCore<any>
  componentContainer: XYContainer<any>
}
