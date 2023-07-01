import { COMPILER_TEST_SAMPLES_PATH } from '$hine/tests';
import fs from 'node:fs';

const testSamples = fs
	.readdirSync(COMPILER_TEST_SAMPLES_PATH)
	.filter(
		(dirname) => dirname[0] !== '[' || dirname[dirname.length - 1] !== ']',
	);

export function load() {
	return { testSamples };
}
