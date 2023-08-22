import type { Action } from './action.js';
import type { AtomicState } from './state/atomic.js';
import type { CompoundState } from './state/compound.js';
import type { Condition } from './condition.js';
import type { Context } from './context.js';
import type { EffectHandler } from './handler/effect.js';
import type { TransitionHandler } from './handler/transition.js';

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

export interface BaseStateConfig {
	always?: (EffectHandler | TransitionHandler)[];
	context?: Context;
	entry?: EffectHandler[];
	exit?: EffectHandler[];
	name?: string;
	on?: Record<string, (EffectHandler | TransitionHandler)[]>;
}

export interface AtomicStateConfig extends BaseStateConfig {}

export interface CompoundStateConfig extends BaseStateConfig {
	children: Record<string, StateNode>;
}

export interface StateConfig extends BaseStateConfig {
	children?: Record<string, StateNode>;
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

export interface BaseStateJSON {
	always: HandlerJSON[] | undefined;
	entry: HandlerJSON[] | undefined;
	exit: HandlerJSON[] | undefined;
	name: string;
	on: Record<string, HandlerJSON[]> | undefined;
	path: string[];
}

export interface AtomicStateJSON extends BaseStateJSON {
	type: 'atomic';
}

export interface CompoundStateJSON extends BaseStateJSON {
	type: 'compound';
	children: Record<string, StateNodeJSON>;
}

export type StateNodeJSON = AtomicStateJSON | CompoundStateJSON;

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

export type StateNode = AtomicState | CompoundState;

export {};
