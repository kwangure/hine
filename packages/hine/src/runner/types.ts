import type { BaseState } from '../state/base.js';
import type { StateConfig } from '../state/types.js';

export type Action<TState extends BaseState<any, any>> = (
	this: void,
	arg: TState,
) => any;

export type Condition<TState extends BaseState<any, any>> = (
	this: void,
	arg: TState,
) => boolean;
