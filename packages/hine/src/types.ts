import type { ActionRunner } from './runner/action.js';
import type { BaseRunnerConfig } from './runner/types.js';
import type { ConditionRunner } from './runner/condition.js';
import type { Context as ContextClass } from './context.js';

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
	actions?: Record<string, ActionRunner>;
	actionConfig?: BaseRunnerConfig;
	conditions?: Record<string, ConditionRunner>;
	conditionConfig?: BaseRunnerConfig;
	context?: Context;
}

export interface AtomicResolveConfig extends BaseResolveConfig {}

export interface CompoundResolveConfig extends BaseResolveConfig {
	children?: Record<string, AtomicResolveConfig | CompoundResolveConfig>;
}

export interface EventOptions {
	name: string;
	value?: string;
}

export interface Context<T extends Record<string, any> = Record<string, any>>
	extends ContextClass {
	get: <K extends keyof T>(key: K) => T[K];
	has: (key: keyof T) => boolean;
	set: <K extends keyof T>(key: K, value: T[K]) => void;
}
