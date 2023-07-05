import fs from 'node:fs';
import { PATTERN_CODEGEN_TEST_SAMPLES_PATH } from '$hine/tests';

const testSamples = fs
	.readdirSync(PATTERN_CODEGEN_TEST_SAMPLES_PATH)
	.filter(
		(dirname) => dirname[0] !== '[' || dirname[dirname.length - 1] !== ']',
	);

export function load() {
	return { testSamples };
}
