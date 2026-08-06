import { XYComponentCore } from '@unovis/ts/core/xy-component'
import { XYContainer } from '@unovis/ts/containers/xy-container'
import { VisCoreComponent } from './core-component'

export class VisXYComponent extends VisCoreComponent {
  declare component: XYComponentCore<any>
  declare componentContainer: XYContainer<any>
}
