import { ComponentCore, ContainerCore } from '@unovis/ts'
import { VisGenericComponent } from './generic-component'

export class VisCoreComponent extends VisGenericComponent {
  component: ComponentCore<any>
  componentContainer: ContainerCore
}
