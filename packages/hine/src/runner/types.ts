import type { BaseState } from '../state/base.js';
import type { StateConfig } from '../state/types.js';

export type Action<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> = (this: void, arg: BaseState<TStateConfig, TContextAncestor>) => any;

export type Condition<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> = (this: void, arg: BaseState<TStateConfig, TContextAncestor>) => boolean;
