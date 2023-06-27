import fs from 'node:fs';
import { TEST_COMPILER_SAMPLES_PATH } from '$tests';

const testSamples = fs.readdirSync(TEST_COMPILER_SAMPLES_PATH)
	.filter((dirname) => dirname[0] !== '[' || dirname[dirname.length - 1] !== ']');

export function load() {
	return { testSamples };
}
