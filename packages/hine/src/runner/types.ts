import type { BaseState } from '../state/base.js';
import { StatePaths } from '../state/types.js';

export type Action<
	TState extends BaseState<any, any>,
	TPath extends string = TState['name'],
> = (
	this: void,
	arg: TPath extends keyof StatePaths<TState> & string
		? StatePaths<TState>[TPath]
		: TState,
) => any;

export type Condition<
	TState extends BaseState<any, any>,
	TPath extends string = TState['name'],
> = (
	this: void,
	arg: TPath extends keyof StatePaths<TState> & string
		? StatePaths<TState>[TPath]
		: TState,
) => boolean;
