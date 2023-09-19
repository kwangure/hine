import type { ActionRunner } from './action.js';
import type { ConditionRunner } from './condition.js';

export interface BaseRunnerConfig {
	name?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
}

export interface ActionRunnerConfig extends BaseRunnerConfig {
	run: (this: undefined, arg: ActionRunner) => any;
}

export interface ConditionRunnerConfig extends BaseRunnerConfig {
	run: (this: undefined, arg: ConditionRunner) => boolean;
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
