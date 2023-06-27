import fs from 'node:fs';
import { PARSER_TEST_SAMPLES_PATH } from '$parserer/tests';

const testSamples = fs
	.readdirSync(PARSER_TEST_SAMPLES_PATH)
	.filter(
		(dirname) => dirname[0] !== '[' || dirname[dirname.length - 1] !== ']',
	);

export function load() {
	return { testSamples };
}
