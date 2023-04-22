import { Action, Condition } from 'src';
import { describe, expect, it } from 'vitest';
import { Handler } from 'src/handler.js';

describe('toJSON', () => {
	it('includes name', () => {
		const name = 'handler';
		const handler = new Handler({ name });
		const json = handler.toJSON();
		expect(json.name).toBe(name);
	});
	it('includes type', () => {
		const name = 'handler';
		const handler = new Handler({ name });
		const json = handler.toJSON();
		expect(json.type).toEqual('handler');
	});
	it('serializes nested actions', () => {
		const name = 'handler';
		const state = new Handler({
			name,
			actions: [
				new Action({
					name: 'action',
					run() {},
				}),
			],
		});
		const json = state.toJSON();
		expect(json.actions).toEqual([
			'action',
		]);
	});
	it('serializes nested condition', () => {
		const name = 'handler';
		const state = new Handler({
			name,
			condition: new Condition({
				name: 'condition',
				run: () => true,
			}),
		});
		const json = state.toJSON();
		expect(json.condition).toEqual('condition');
	});
});
