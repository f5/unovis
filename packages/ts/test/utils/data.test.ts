import test from 'node:test'
import assert from 'node:assert/strict'

import { isEqual } from '@/utils/data'

test('isEqual: a reference that repeats in `a` is compared against each of its counterparts in `b`', async (t) => {
  // `isEqual` carries a `visited` set to survive cyclic structures. It used to keep every reference it
  // had ever seen, so the *second* time a repeated reference came up it reported "equal" without looking
  // at `b` at all. Framework wrappers compare whole prop trees with this, so a false positive there
  // silently swallows a real prop change — the chart keeps its old config and never repaints.
  const sharedArray = [1, 2, 3]
  const sharedObject = { a: 1 }

  await t.test('repeated array reference, second counterpart differs', () => {
    assert.equal(isEqual({ x: sharedArray, y: sharedArray }, { x: sharedArray, y: [9, 9, 9] }), false)
  })

  await t.test('repeated array reference vs deep-equal then differing copies', () => {
    assert.equal(isEqual({ x: sharedArray, y: sharedArray }, { x: [1, 2, 3], y: [9, 9, 9] }), false)
  })

  await t.test('repeated object reference vs deep-equal then differing copies', () => {
    assert.equal(isEqual({ x: sharedObject, y: sharedObject }, { x: { a: 1 }, y: { a: 2 } }), false)
  })

  await t.test('repeated reference inside an array', () => {
    assert.equal(isEqual([sharedArray, sharedArray], [[1, 2, 3], [9, 9, 9]]), false)
    assert.equal(isEqual([sharedObject, sharedObject], [sharedObject, { a: 2 }]), false)
  })

  await t.test('an accessor is still compared when it is the only thing behind a repeated reference', () => {
    // The shape that made this bite in practice: the changed accessor is the *only* difference, and it
    // sits behind the second occurrence of a repeated reference, so nothing else fails the comparison.
    const red = (): string => 'red'
    const blue = (): string => 'blue'
    const shared = [{ color: red }]

    assert.equal(isEqual(
      { a: shared, b: shared },
      { a: [{ color: red }], b: [{ color: blue }] }
    ), false)
  })

  await t.test('equal counterparts stay equal', () => {
    assert.equal(isEqual({ x: sharedArray, y: sharedArray }, { x: [1, 2, 3], y: [1, 2, 3] }), true)
    assert.equal(isEqual(sharedArray, sharedArray), true)
  })
})

test('isEqual: cyclic structures terminate', async (t) => {
  await t.test('self-referencing objects', () => {
    const a: Record<string, unknown> = { n: 1 }; a.self = a
    const b: Record<string, unknown> = { n: 1 }; b.self = b
    const c: Record<string, unknown> = { n: 2 }; c.self = c

    assert.equal(isEqual(a, b), true)
    assert.equal(isEqual(a, c), false)
  })

  await t.test('self-referencing arrays', () => {
    const a: unknown[] = [1]; a.push(a)
    const b: unknown[] = [1]; b.push(b)

    assert.equal(isEqual(a, b), true)
  })

  await t.test('a mutually-referential cycle compared against a self cycle', () => {
    const m1: unknown[] = [1]; const m2: unknown[] = [1]
    m1.push(m2); m2.push(m1)
    const n1: unknown[] = [1]; n1.push(n1)

    assert.equal(isEqual(n1, m1), true)
  })
})

test('isEqual: basics', async (t) => {
  await t.test('primitives', () => {
    assert.equal(isEqual(1, 1), true)
    assert.equal(isEqual(1, 2), false)
    assert.equal(isEqual('a', 'a'), true)
    assert.equal(isEqual(NaN, NaN), false)
    assert.equal(isEqual(undefined, undefined), true)
    assert.equal(isEqual(null, null), true)
    assert.equal(isEqual(null, {}), false)
    assert.equal(isEqual({}, null), false)
  })

  await t.test('dates compare by time', () => {
    assert.equal(isEqual(new Date(5), new Date(5)), true)
    assert.equal(isEqual(new Date(5), new Date(6)), false)
  })

  await t.test('shape mismatches', () => {
    assert.equal(isEqual([1], { 0: 1 }), false)
    assert.equal(isEqual([1, 2], [1, 2, 3]), false)
    assert.equal(isEqual({ a: 1 }, { b: 1 }), false)
    assert.equal(isEqual({ a: 1 }, { a: 1, b: 2 }), false)
  })

  await t.test('functions compare by identity', () => {
    const fn = (): number => 1
    assert.equal(isEqual({ f: fn }, { f: fn }), true)
    assert.equal(isEqual({ f: () => 1 }, { f: () => 1 }), false)
  })

  await t.test('skipKeys are ignored', () => {
    assert.equal(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 }, ['b']), true)
    assert.equal(isEqual({ a: 1, b: 2 }, { a: 2, b: 2 }, ['b']), false)
  })
})
