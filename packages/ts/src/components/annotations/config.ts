import { ComponentConfig, ComponentConfigInterface } from 'core/component/config'

// Types
import { AnnotationDatum } from './types'

export interface AnnotationsConfigInterface<Datum extends AnnotationDatum> extends ComponentConfigInterface {
  duration?: number;
}

export class AnnotationsConfig<Datum extends AnnotationDatum> extends ComponentConfig implements AnnotationsConfigInterface<Datum> {
  duration = 0
}
