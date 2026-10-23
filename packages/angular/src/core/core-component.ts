import { ComponentCore } from '@unovis/ts/core/component'
import { ContainerCore } from '@unovis/ts/core/container'
import { VisGenericComponent } from './generic-component'

export class VisCoreComponent extends VisGenericComponent {
  declare component: ComponentCore<any>
  declare componentContainer: ContainerCore
}
