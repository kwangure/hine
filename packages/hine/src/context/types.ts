export interface ContextTransformer<TInput = unknown, TOutput = any> {
	(value: TInput): TOutput;
}

export type IsAny<T> = 0 extends 1 & T ? true : false;
