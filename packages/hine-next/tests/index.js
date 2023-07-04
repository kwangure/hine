import path from 'node:path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

export const CODEGEN_TEST_SAMPLES_PATH = path.join(
	__dirname,
	'./codegen/samples',
);

export const MONITOR_CODEGEN_TEST_SAMPLES_PATH = path.join(
	__dirname,
	'./codegen/monitor/samples',
);

export const COMPILER_TEST_SAMPLES_PATH = path.join(
	__dirname,
	'./compiler/samples',
);
