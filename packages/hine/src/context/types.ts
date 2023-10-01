export type ContextType<T, TFallback> = T extends { types: infer U }
	? U extends { context: infer V }
		? V
		: TFallback
	: TFallback;

export type Merge<T, U> = Omit<T, keyof U> & U;

export type KeyOfMerged<K extends string, T, U> = K extends keyof Merge<T, U>
	? K
	: keyof Merge<T, U>;

export type ValueOfMerged<K extends string, T, U> = K extends keyof Merge<T, U>
	? Merge<T, U>[K]
	: never;

export type IsAny<T> = 0 extends 1 & T ? true : false;
