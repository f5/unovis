export type RemovePrefix<T extends string, Prefix extends string> = T extends `${Prefix}${infer Tail}` ? `${Tail}` : T
export type KebabToCamelCase<T extends string> =
  T extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<KebabToCamelCase<Tail>>}`
    : T;

export type CamelCase<T> = {
  [Property in keyof T as KebabToCamelCase<Property & string>]: T[Property];
}
