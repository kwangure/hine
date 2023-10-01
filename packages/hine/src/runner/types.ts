import type { ActionRunner } from './action.js';
import type { ConditionRunner } from './condition.js';
import type { StateConfig } from '../state/types.js';

export interface BaseRunnerConfig {
	name?: string;
}

export interface ActionRunnerConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> extends BaseRunnerConfig {
	run: (
		this: undefined,
		arg: ActionRunner<TStateConfig, TContextAncestor>,
	) => any;
}

export interface ConditionRunnerConfig<
	TStateConfig extends StateConfig,
	TContextAncestor extends Record<string, any>,
> extends BaseRunnerConfig {
	run: (
		this: undefined,
		arg: ConditionRunner<TStateConfig, TContextAncestor>,
	) => boolean;
}

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
