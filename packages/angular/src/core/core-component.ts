import { ComponentCore, ContainerCore } from '@unovis/ts'
import { VisGenericComponent } from './generic-component'

export class VisCoreComponent extends VisGenericComponent {
  declare component: ComponentCore<any>
  declare componentContainer: ContainerCore
}
