/**
 * @link https://github.com/sindresorhus/type-fest/blob/47626cf470853b1828b44637114292a84bf58817/source/simplify.d.ts
 *
 * Useful to flatten the type output to improve type hints shown in editors. And also to transform
 * an interface into a type to aide with assignability.
 *
 * @example
 *
 * import type {Simplify} from 'type-fest';
 *
 * type PositionProps = {
 *     top: number;
 *     left: number;
 * };
 *
 * type SizeProps = {
 *     width: number;
 *     height: number;
 * };
 *
 * // In your editor, hovering over `Props` will show a flattened object with all the properties.
 * type Props = Simplify<PositionProps & SizeProps>;
 *
 * @example <caption> Make interface assignable to type </caption>
 *
 * import type {Simplify} from 'type-fest';
 *
 * interface SomeInterface {
 *     foo: number;
 *     bar?: string;
 *     baz: number | undefined;
 * }
 *
 * type SomeType = {
 *     foo: number;
 *     bar?: string;
 *     baz: number | undefined;
 * };
 *
 * const literal = {foo: 123, bar: 'hello', baz: 456};
 * const someType: SomeType = literal;
 * const someInterface: SomeInterface = literal;
 *
 * function fn(object: Record<string, unknown>): void {}
 *
 * fn(literal); // Good: literal object type is sealed
 * fn(someType); // Good: type is sealed
 * fn(someInterface); // Error: Index signature for type 'string' is missing in type 'someInterface'. Because `interface` can be re-opened
 * fn(someInterface as Simplify<SomeInterface>); // Good: transform an `interface` into a `type`
 *
 * @link https://github.com/microsoft/TypeScript/issues/15300
 *
 * @category Object
 */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};
