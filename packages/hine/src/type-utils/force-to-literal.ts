/**
 * Returns a value if it's a literal string otherwise returns the literal `''`
 *
 * @example <caption>Non-string</caption>
 * type Literal = ForceToLiteralString<1>;
 * => ''
 *
 * @example <caption>General string</caption>
 * type Literal = ForceToLiteralString<string>;
 * => ''
 *
 * @example <caption>Literal string</caption>
 * type LiteralForceToLiteralString<'yes'>;
 * => 'yes'
 *
 */
type ForceToLiteralString<T> = T extends string
	? string extends T
		? ''
		: T
	: '';
