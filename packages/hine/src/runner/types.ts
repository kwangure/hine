import type { BaseRunner } from './base.js';
import type { StateConfig } from '../state/types.js';

export type ActionRunnerConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> = (this: undefined, arg: BaseRunner<TStateConfig, TContextAncestor>) => any;

export type ConditionRunnerConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> = (
	this: undefined,
	arg: BaseRunner<TStateConfig, TContextAncestor>,
) => boolean;

interface BaseRunnerJSON {
	name: string;
	path: string[];
}

export interface ActionJSON extends BaseRunnerJSON {
	name: string;
	path: string[];
	type: 'action';
}

export interface ConditionJSON extends BaseRunnerJSON {
	type: 'condition';
}
