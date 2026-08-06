import { XYComponentCore } from '@unovis/ts/core/xy-component'
import { XYContainer } from '@unovis/ts/containers/xy-container'
import { VisCoreComponent } from './core-component'

export class VisXYComponent extends VisCoreComponent {
  component: XYComponentCore<any>
  componentContainer: XYContainer<any>
}
