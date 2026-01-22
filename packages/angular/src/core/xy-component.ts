import { XYComponentCore, XYContainer } from '@unovis/ts'
import { VisCoreComponent } from './core-component'

export class VisXYComponent extends VisCoreComponent {
  declare component: XYComponentCore<any>
  declare componentContainer: XYContainer<any>
}
