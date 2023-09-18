import type {
	ActionRunnerConfig,
	BaseRunnerConfig,
	ConditionRunnerConfig,
} from './runner/types.js';

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
	actions?: Record<string, ActionRunnerConfig | ActionRunnerConfig['run']>;
	actionConfig?: BaseRunnerConfig;
	conditions?: Record<
		string,
		ConditionRunnerConfig | ConditionRunnerConfig['run']
	>;
	conditionConfig?: BaseRunnerConfig;
	context?: Record<string, unknown>;
}

export interface AtomicResolveConfig extends BaseResolveConfig {}

export interface CompoundResolveConfig extends BaseResolveConfig {
	children?: Record<string, AtomicResolveConfig | CompoundResolveConfig>;
}

export interface EventOptions {
	name: string;
	value?: string;
}
