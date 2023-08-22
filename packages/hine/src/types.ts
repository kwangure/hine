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

export interface BaseHandlerConfig {
	run?: string[];
	if?: string;
	notifyAfter?: boolean;
	notifyBefore?: boolean;
}

export interface EffectHandlerConfig extends BaseHandlerConfig {
	run: string[];
}

export interface TransitionHandlerConfig extends BaseHandlerConfig {
	goto: string;
}

export interface HandlerConfig extends BaseHandlerConfig {
	goto?: string;
}

interface BaseHandlerJSON {
	name: string;
	if: string | undefined;
	run: string[];
	path: string[];
}

export interface EffectHandlerJSON extends BaseHandlerJSON {
	type: 'effect';
}

export interface TransitionHandlerJSON extends BaseHandlerJSON {
	type: 'transition';
	goto: string | undefined;
}

export type HandlerJSON = EffectHandlerJSON | TransitionHandlerJSON;

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

export interface BaseMonitorConfig {
	actions?: Record<string, Action>;
	actionConfig?: RunnerConfig;
	conditions?: Record<string, Condition>;
	conditionConfig?: RunnerConfig;
}

export interface AtomicMonitorConfig extends BaseMonitorConfig {}

export interface CompoundMonitorConfig extends BaseMonitorConfig {
	children?: Record<string, AtomicMonitorConfig | CompoundMonitorConfig>;
}

export interface EventOptions {
	name: string;
	value?: string;
}

export {};
