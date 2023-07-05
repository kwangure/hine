import { createParser, parseFile } from 'parserer';
import { describe, expect, test } from 'vitest';
import { tryToLoadJS, tryToLoadJson } from '../../helpers.js';
import fs from 'node:fs';
import { generateMachine } from '../../../src/codegen/codegen.js';
import { processPattern } from '../../../src/processor/pattern.js';

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
			const expectedCodeOutput = tryToLoadJS(
				`${__dirname}/samples/${dir}/output.js`,
			);
			const expectedConfigOutput = tryToLoadJson(
				`${__dirname}/samples/${dir}/output.json`,
			);

			const parser = createParser();
			parseFile(parser, input);
			const ast = parser.context.html.toJSON();
			const config = processPattern(ast);
			const actualOutput = generateMachine(config);

			fs.writeFileSync(
				`${__dirname}/samples/${dir}/_actual.json`,
				JSON.stringify(config, null, 4),
			);
			fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.js`, actualOutput);
			expect(actualOutput).toEqual(expectedCodeOutput);
			expect(config).toEqual(expectedConfigOutput);
		});
	}
});
