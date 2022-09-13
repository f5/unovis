import { XYComponentCore, XYContainer } from '@unovis/ts'
import { VisCoreComponent } from './core-component'

export class VisXYComponent extends VisCoreComponent {
  component: XYComponentCore<any>
  componentContainer: XYContainer<any>
}
