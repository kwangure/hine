export type ContextKey<TAncestor, TOwn> = KeyOfUnionString<
	Merge<TAncestor, TOwn>
>;

export type ContextValue<K extends string, T, U> = K extends keyof Merge<T, U>
	? Merge<T, U>[K]
	: unknown;

export type Merge<T, U> = Omit<T, keyof U> & U;

declare const emptyObjectSymbol: unique symbol;

export type EmptyObject = { [emptyObjectSymbol]?: never };

export type KeyOfUnionString<TContext extends Record<string, any>> =
	TContext extends EmptyObject
		? string
		: keyof TContext extends string
		? // https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939
		  keyof TContext | (string & {})
		: never;
