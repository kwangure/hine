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
