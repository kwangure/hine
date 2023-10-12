import { Simplify } from '../type-utils/simplify';

// Since keyof `{}` returns `never`, fallback to string instead
// Otherwise only allow keys of the context records
export type ContextKey<TAncestor, TOwn> = Merge<
	TAncestor,
	TOwn
> extends EmptyObject
	? string
	: keyof Merge<TAncestor, TOwn> extends string
	? keyof Merge<TAncestor, TOwn>
	: never;

export type ContextValue<K extends string, T, U> = Merge<
	T,
	U
> extends EmptyObject
	? unknown
	: K extends keyof Merge<T, U>
	? Merge<T, U>[K]
	: never;

export type Merge<T, U> = Simplify<Omit<T, keyof U> & U>;

declare const emptyObjectSymbol: unique symbol;

export type EmptyObject = { [emptyObjectSymbol]?: never };
