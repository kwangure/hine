import type { Action } from './action.js';
import type { Condition } from './condition.js';

interface RunnerConfig {
	name?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
}

export interface ActionConfig extends RunnerConfig {
	run: (this: undefined, arg: Action) => any;
}

export interface ConditionConfig extends RunnerConfig {
	run: (this: undefined, arg: Condition) => boolean;
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

export interface BaseResolveConfig {
	actions?: Record<string, Action>;
	actionConfig?: RunnerConfig;
	conditions?: Record<string, Condition>;
	conditionConfig?: RunnerConfig;
}

export interface AtomicResolveConfig extends BaseResolveConfig {}

export interface CompoundResolveConfig extends BaseResolveConfig {
	children?: Record<string, AtomicResolveConfig | CompoundResolveConfig>;
}

export interface EventOptions {
	name: string;
	value?: string;
}
