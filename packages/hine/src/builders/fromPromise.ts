import type { StateEvent } from '../event/event.js';
import { emitEvent } from '../methods/emit.js';
import { atomic } from '../states/atomic.js';
import { compound, type CompoundStateConfig } from '../states/compound.js';
import type { StateNode } from '../states/types.js';
import { normalizeListener } from '../utils/normalizeListener.js';

type OnHandler = NonNullable<CompoundStateConfig['on']>[string];

export interface FromPromiseOptions {
	hooks?: CompoundStateConfig['hooks'];
	on?: {
		reject?: OnHandler;
		resolve?: OnHandler;
	};
}

export function fromPromise(
	name: string,
	promise: Promise<unknown>,
	options?: FromPromiseOptions,
) {
	let rootState: StateNode;
	const isPromise = (event: StateEvent) =>
		isPromiseStateEvent(event) && event.detail.promise === promise;
	return compound(name, {
		hooks: {
			...options?.hooks,
			afterEntry: [
				(event) => {
					rootState = event.target;
					promise
						.then((result) =>
							emitEvent(rootState, 'resolve', {
								result,
								promise,
							}),
						)
						.catch((result) =>
							emitEvent(rootState, 'reject', { result, promise }),
						);
				},
				...(options?.hooks?.afterEntry
					? normalizeListener(options.hooks.afterEntry)
					: []),
			],
		},
		initial: 'pending',
		children: [
			atomic('pending', {
				on: {
					resolve: {
						if: isPromise,
						goto: 'resolved',
					},
					reject: {
						if: isPromise,
						goto: 'rejected',
					},
				},
			}),
			atomic('resolved'),
			atomic('rejected'),
		],
		...(options?.on ? { on: options.on } : {}),
	});
}

export interface PromiseStateEvent<
	T extends 'reject' | 'resolve' = 'reject' | 'resolve',
> extends StateEvent {
	type: T;
	detail: {
		result: unknown;
		promise: Promise<unknown>;
	};
}

export function isPromiseStateEvent(
	event: StateEvent,
): event is PromiseStateEvent {
	return (
		(event.type === 'reject' || event.type == 'resolve') &&
		typeof event.detail === 'object' &&
		event.detail !== null &&
		'promise' in event.detail &&
		'result' in event.detail
	);
}
