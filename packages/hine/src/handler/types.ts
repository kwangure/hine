export interface BaseHandlerConfig {
	run?: string[];
	if?: string;
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
