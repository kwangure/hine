export interface ContextTransformer<TInput = unknown, TOutput = any> {
	(value: TInput): TOutput;
}
