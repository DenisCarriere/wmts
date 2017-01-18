import { range, clean } from './'

describe('range', () => {
  test('range(3)', () => expect(range(3)).toEqual([0, 1, 2]))
  test('range(0, 3)', () => expect(range(0, 3)).toEqual([0, 1, 2]))
  test('range(3, 0, -1)', () => expect(range(3, 0, -1)).toEqual([3, 2, 1]))
})

describe('clean', () => {
  test('clean({foo: 10, bar: undefined})', () => expect(clean({foo: 10, bar: undefined})).toEqual({foo: 10}))
  test('clean({foo: undefined, bar: undefined})', () => expect(clean({foo: undefined, bar: undefined})).toEqual({}))
  test('clean({foo: 0})', () => expect(clean({foo: 0})).toEqual({foo: 0}))
})
