// Copyright (c) Volterra, Inc. All rights reserved.

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
}
