import path from 'node:path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

export const TEST_COMPILER_SAMPLES_PATH = path.join(__dirname, './compiler/samples');
