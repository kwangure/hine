import type { ActionRunner } from './action.js';
import type { ConditionRunner } from './condition.js';
import type { StateConfig } from '../state/types.js';

export interface BaseRunnerConfig {
	name?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
}

export interface ActionRunnerConfig<TStateConfig extends StateConfig>
	extends BaseRunnerConfig {
	run: (this: undefined, arg: ActionRunner<TStateConfig>) => any;
}

export interface ConditionRunnerConfig<TStateConfig extends StateConfig>
	extends BaseRunnerConfig {
	run: (this: undefined, arg: ConditionRunner<TStateConfig>) => boolean;
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
