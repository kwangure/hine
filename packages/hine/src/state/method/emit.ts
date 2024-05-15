import { StateEvent, setCurrentTarget } from '../event/event.js';
import type { StateNode } from '../types.js';

/**
 * `emitEvent` handles emitting events to a state machine.
 *
 * It is a high-level method for triggering events that can cause state
 * transitions or invoke side-effects within the state machine.
 *
 * @param machine - The state machine instance to which the event is emitted.
 * @param type - The name of the event to emit. This should correspond to an
 *               event name recognized by the state machine, capable of
 *               triggering transitions or actions.
 * @param detail
 */
export function emitEvent(machine: StateNode, type: string, detail?: unknown) {
	const event = new StateEvent(type, machine, detail);
	__emitEvent(machine, event, [machine.name]);
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
 * @param machine - The state machine or a part of the state hierarchy to which
 *                  the event is emitted.
 * @param event - The name of the event being emitted.
 * @param path - An array representing the path taken through the state hierarchy
 *               during the emitting process. Used for error reporting and debugging.
 * @param parent - The parent state of the current machine, if applicable.
 *                 This is used for managing transitions within compound states.
 */
function __emitEvent(
	machine: StateNode,
	event: StateEvent,
	path: string[],
	parent?: StateNode,
) {
	machine.activeChildren.forEach(([name, state]) => {
		path.push(name);
		__emitEvent(state, event, path, machine);
		path.pop();
	});
	const listeners = machine.listeners.get(event.type);
	if (!listeners) return;

	setCurrentTarget(event, machine);

	for (const listener of listeners) {
		if (listener.if && !listener.if(event)) return;

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
			runExitHooks(machine, event);
			parent.__goto(listener.goto, path);
			runEntryHooks(parent.children.get(listener.goto)!, event);
			// transitions prevent later handlers from being executed
			break;
		}
	}
}

export function runEntryHooks(machine: StateNode, event: StateEvent) {
	__runHooksRootFirst(machine, event, 'afterEntry', [machine.name]);
}
function __runHooksRootFirst(
	machine: StateNode,
	event: StateEvent,
	hook: 'afterEntry' | 'beforeExit',
	path: string[],
) {
	setCurrentTarget(event, machine);
	const hooks = machine.hooks.get(hook);
	if (hooks) {
		for (const listener of hooks) {
			if (!listener.if || listener.if(event)) {
				listener.run?.(event);
			}
		}
	}
	machine.activeChildren.forEach(([name, state]) => {
		path.push(name);
		__runHooksRootFirst(state, event, hook, path);
		path.pop();
	});
}

export function runExitHooks(machine: StateNode, event: StateEvent) {
	__runHooksLeafFirst(machine, event, 'beforeExit', [machine.name]);
}
function __runHooksLeafFirst(
	machine: StateNode,
	event: StateEvent,
	hook: 'afterEntry' | 'beforeExit',
	path: string[],
) {
	machine.activeChildren.forEach(([name, state]) => {
		path.push(name);
		__runHooksLeafFirst(state, event, hook, path);
		path.pop();
	});

	setCurrentTarget(event, machine);
	const hooks = machine.hooks.get(hook);
	if (hooks) {
		for (const listener of hooks) {
			if (!listener.if || listener.if(event)) {
				listener.run?.(event);
			}
		}
	}
}
