import type { AtomicState } from './atomic.js';
import type { CompoundState } from './compound.js';
import type { Context } from '../context.js';
import type { EffectHandler } from '../handler/effect.js';
import type { TransitionHandler } from '../handler/transition.js';
import type { HandlerJSON } from '../handler/types.js';

export type StateNode = AtomicState | CompoundState;

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
