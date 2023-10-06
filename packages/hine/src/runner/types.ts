import type { BaseHandler } from '../handler/base.js';
import type { StateConfig } from '../state/types.js';

export type Action<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> = (this: void, arg: BaseHandler<TStateConfig, TContextAncestor>) => any;

export type Condition<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> = (this: void, arg: BaseHandler<TStateConfig, TContextAncestor>) => boolean;
