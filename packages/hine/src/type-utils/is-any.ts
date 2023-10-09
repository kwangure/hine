/**
 * @link https://github.com/sindresorhus/type-fest/blob/47626cf470853b1828b44637114292a84bf58817/source/is-any.d.ts
 *
 * Returns a boolean for whether the given type is `any`.
 *
 * @link https://stackoverflow.com/a/49928360/1490091
 *
 * Useful in type utilities, such as disallowing `any`s to be passed to a function.
 *
 * @example
 * import type {IsAny} from 'type-fest';
 *
 * const typedObject = {a: 1, b: 2} as const;
 * const anyObject: any = {a: 1, b: 2};
 *
 * function get<O extends (IsAny<O> extends true ? {} : Record<string, number>), K extends keyof O = keyof O>(obj: O, key: K) {
 *     return obj[key];
 * }
 *
 * const typedA = get(typedObject, 'a');
 * //=> 1
 *
 * const anyA = get(anyObject, 'a');
 * //=> any
 *
 * @category Type Guard
 * @category Utilities
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;
