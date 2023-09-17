import { describe, expect, it } from 'vitest';
import { ActionRunner } from '../../src/runner/action.js';
import { ConditionRunner } from '../../src/runner/condition.js';
import { TransitionHandler } from '../../src/handler/transition.js';

// TODO: Update to the new TransitionHandler API
describe.skip('toJSON', () => {
	it('includes name', () => {
		// @ts-expect-error
		const handler = new TransitionHandler();
		handler.__name = 'handler';
		const json = handler.toJSON();
		expect(json.name).toBe(handler.__name);
	});
	it('includes type', () => {
		// @ts-expect-error
		const handler = new TransitionHandler();
		const json = handler.toJSON();
		expect(json.type).toEqual('transition');
	});
	it('includes path', () => {
		// @ts-expect-error
		const handler = new TransitionHandler();
		handler.__name = 'handler';
		const json = handler.toJSON();
		expect(json.path).toEqual(['[handler]']);
	});
	it('serializes nested actions', () => {
		const name = 'handler';
		const state = new TransitionHandler({
			// @ts-expect-error
			name,
			actions: [
				// @ts-ignore
				new ActionRunner({
					name: 'action',
					run() {},
				}),
			],
		});
		const json = state.toJSON();
		// @ts-expect-error
		expect(json.actions).toEqual(['action']);
	});
	it('serializes nested condition', () => {
		const name = 'handler';
		const state = new TransitionHandler({
			// @ts-expect-error
			name,
			// @ts-ignore
			condition: new ConditionRunner({
				name: 'condition',
				run: () => true,
			}),
		});
		const json = state.toJSON();
		// @ts-expect-error
		expect(json.condition).toEqual('condition');
	});
});
