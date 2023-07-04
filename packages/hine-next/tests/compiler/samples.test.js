import { createParser, parseFile } from 'parserer';
import { describe, expect, test } from 'vitest';
import { compileSpec } from '../../src/compiler/specification.js';
import fs from 'node:fs';
import { tryToLoadJson } from '../helpers.js';

describe('parse', () => {
	const samples = fs.readdirSync(`${__dirname}/samples`);
	for (const dir of samples) {
		// add .only to a sample directory name to only run that test
		const only = /\.only$/.test(dir);
		if (only && process.env.CI) {
			throw new Error(`Forgot to remove '.only' from test test/samples/${dir}`);
		}

		// add .skip to a sample directory name to skip that test
		let skip = /\.skip$/.test(dir);
		if (skip && process.env.CI) {
			throw new Error(`Forgot to remove '.skip' from test test/samples/${dir}`);
		}

		if (!fs.existsSync(`${__dirname}/samples/${dir}/input.hine`)) {
			skip = true;
		}

		/** @type {typeof test | typeof test.skip} */
		let runner = test;
		if (skip) {
			runner = test.skip;
		} else if (only) {
			runner = test.only;
		}

		runner(dir, () => {
			const input = fs
				.readFileSync(`${__dirname}/samples/${dir}/input.hine`, 'utf-8')
				.replace(/\s+$/, '')
				.replace(/\r/g, '');
			const expectedOutput = tryToLoadJson(
				`${__dirname}/samples/${dir}/output.json`,
			);

			const parser = createParser();
			parseFile(parser, input);
			const ast = parser.context.html.toJSON();
			const actualOutput = compileSpec(ast);
			fs.writeFileSync(
				`${__dirname}/samples/${dir}/_actual.json`,
				JSON.stringify(actualOutput, null, 4),
			);
			expect(actualOutput).toEqual(expectedOutput);
		});
	}
});
