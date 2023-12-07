import type { BaseState } from '../state/base.js';
import type { StatePaths } from '../state/types.js';

/**
 * `Action` is a function that can be executed as a side effect of a state transition or on entry/exit of a state.
 * It receives the state object on which it is defined as its only argument.
 *
 * @template TState - The type of the state object on which the action is defined.
 * @template TPath - The dot-notation path to the state object in a state tree where the function will be defined.
 * 					 This provides type safety for an action defined elsewhere then assigned to the tree.
 * 				     Defaults to the 'name' property of the provided `TState`.
 *
 * @param this - 'this' is not defined in the function.
 * @param arg - The state object on which the action is defined.
 * @returns The return value of the action is not used or checked.
 */
export type Action<
	TState extends BaseState<any, any>,
	TPath extends string = TState['name'],
> = (
	this: void,
	arg: TPath extends keyof StatePaths<TState> & string
		? StatePaths<TState>[TPath]
		: TState,
) => any;

/**
 * `Condition` is a predicate function used in state transitions to determine whether a transition
 * should be taken based on the current state and event on the machine.
 * It receives the state object on which it is defined as its only argument.
 *
 * @template TState - The type of the state object on which the condition is defined.
 * @template TPath - The dot-notation path to the state object in a state tree where the function will be defined.
 * 					 This provides type safety for an condition defined elsewhere then assigned to the tree.
 *                   Defaults to the 'name' property of the `TState`.
 *
 * @param this - 'this' is not defined in the function.
 * @param arg - The state object or substate object, depending on `TPath`.
 * @returns Returns a boolean indicating whether actions and transitions should be executed.
 */
export type Condition<
	TState extends BaseState<any, any>,
	TPath extends string = TState['name'],
> = (
	this: void,
	arg: TPath extends keyof StatePaths<TState> & string
		? StatePaths<TState>[TPath]
		: TState,
) => boolean;
