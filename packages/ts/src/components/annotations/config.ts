import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Types
import { AnnotationItem } from './types'

export interface AnnotationsConfigInterface extends ComponentConfigInterface {
  /** Legend items. Array of `AnnotationItem`:
   * ```
   * {
   *   content: string | UnovisText | UnovisText[];
   *   subject?: AnnotationSubject;
   *   x?: LengthUnit;
   *   y?: LengthUnit;
   *   width?: LengthUnit;
   *   height?: LengthUnit;
   * }
   * ```
   * To learn more, see our docs https://unovis.dev/docs/auxiliary/Annotations/
  * Default: `[]` */
  items: AnnotationItem[] | undefined;
}

export const AnnotationsDefaultConfig: AnnotationsConfigInterface = {
  ...ComponentDefaultConfig,
  items: [],
}
