import { StateEvent, setCurrentTarget } from '../event/event.js';
import type { StateNode } from '../types.js';

/**
 * `emitEvent` handles emitting events to a state machine.
 *
 * It is a high-level method for triggering events that can cause state
 * transitions or invoke side-effects within the state machine.
 *
 * @param state - The state machine instance to which the event is emitted.
 * @param type - The name of the event to emit. This should correspond to an
 *               event name recognized by the state machine, capable of
 *               triggering transitions or actions.
 * @param detail
 */
export function emitEvent(state: StateNode, type: string, detail?: unknown) {
	const event = new StateEvent(type, state, detail);
	__emitEvent(state, event, [state.name]);
}

/**
 * `__emitEvent` handles emitting events to a state machine.
 *
 * It is responsible for propagating events down the hierarchy of a state tree
 * and managing state transitions based on the event and the current state of
 * the machine.
 *
 * The function is to be used internally by `emitEvent`.
 *
 * @param state - The state machine or a part of the state hierarchy to which
 *                  the event is emitted.
 * @param event - The name of the event being emitted.
 * @param path - An array representing the path taken through the state hierarchy
 *               during the emitting process. Used for error reporting and debugging.
 * @param parent - The parent state of the current machine, if applicable.
 *                 This is used for managing transitions within compound states.
 */
function __emitEvent(
	state: StateNode,
	event: StateEvent,
	path: string[],
	parent?: StateNode,
) {
	state.activeChildren.forEach((child) => {
		path.push(child.name);
		__emitEvent(child, event, path, state);
		path.pop();
	});
	const listeners = state.listeners.get(event.type);
	if (!listeners) return;

	setCurrentTarget(event, state);

	for (const listener of listeners) {
		if (listener.if && !listener.if(event)) continue;

		listener.run?.(event);

		if (typeof listener.goto === 'string') {
			if (!parent) {
				throw Error(
					`State '${path.join(
						'.',
					)}' attempted to transition to sibling '${
						listener.goto
					}' in a state without a parent`,
				);
			}
			runExitHooks(state, event);
			parent.__goto(listener.goto, path);
			runEntryHooks(parent.children.get(listener.goto)!, event);
			// transitions prevent later handlers from being executed
			break;
		}
	}
}

export function runEntryHooks(state: StateNode, event: StateEvent) {
	__runHooksRootFirst(state, event, 'afterEntry', [state.name]);
}
function __runHooksRootFirst(
	state: StateNode,
	event: StateEvent,
	hook: 'afterEntry' | 'beforeExit',
	path: string[],
) {
	setCurrentTarget(event, state);
	const hooks = state.hooks.get(hook);
	if (hooks) {
		for (const listener of hooks) {
			if (!listener.if || listener.if(event)) {
				listener.run?.(event);
			}
		}
	}
	state.activeChildren.forEach((child) => {
		path.push(child.name);
		__runHooksRootFirst(child, event, hook, path);
		path.pop();
	});
}

export function runExitHooks(state: StateNode, event: StateEvent) {
	__runHooksLeafFirst(state, event, 'beforeExit', [state.name]);
}
function __runHooksLeafFirst(
	state: StateNode,
	event: StateEvent,
	hook: 'afterEntry' | 'beforeExit',
	path: string[],
) {
	state.activeChildren.forEach((child) => {
		path.push(child.name);
		__runHooksLeafFirst(child, event, hook, path);
		path.pop();
	});

	setCurrentTarget(event, state);
	const hooks = state.hooks.get(hook);
	if (hooks) {
		for (const listener of hooks) {
			if (!listener.if || listener.if(event)) {
				listener.run?.(event);
			}
		}
	}
}
