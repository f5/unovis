/** Prefix of the generated class names, e.g. `unovis-1q2w3e-legend-item` */
export const CSS_CLASS_NAME_PREFIX = 'unovis'

/** Attribute that marks the `<style>` element with the Unovis styles */
export const CSS_STYLE_ELEMENT_ATTRIBUTE = 'data-unovis'

/** `label: name;` declarations name the generated classes, like in Emotion */
export const CSS_LABEL_PATTERN = /(?:^|[\s;{])label:\s*([^\s;{]+)\s*(?:;|$)/g

/** Properties Safari still needs with the `-webkit-` prefix */
export const CSS_WEBKIT_PREFIXED_PROPERTIES = ['user-select', 'backdrop-filter', 'mask']
