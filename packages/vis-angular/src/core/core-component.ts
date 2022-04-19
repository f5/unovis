import { ComponentCore, ContainerCore } from '@volterra/vis'
import { VisGenericComponent } from './generic-component'

export class VisCoreComponent extends VisGenericComponent {
  component: ComponentCore<any>
  componentContainer: ContainerCore
}
