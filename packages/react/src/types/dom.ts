// eslint-disable-next-line @typescript-eslint/naming-convention
export type VisComponentElement<T, E = HTMLElement> = E & {__component__: T}
