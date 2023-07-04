import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import { SPEC_CODEGEN_TEST_SAMPLES_PATH } from '$hine/tests';

export function load({ params }) {
	const { name } = params;
	const sampleDirNames = fs
		.readdirSync(SPEC_CODEGEN_TEST_SAMPLES_PATH, { withFileTypes: true })
		.filter((dirEntry) => dirEntry.isDirectory())
		.map((dirEntry) => dirEntry.name);
	const currentIndex = sampleDirNames.findIndex((dirName) => dirName === name);

	if (currentIndex === -1) {
		throw error(404, 'Test directory not found.');
	}

	return {
		next: sampleDirNames[currentIndex + 1] || '',
		previous: sampleDirNames[currentIndex - 1] || '',
		sample: {
			name,
			content: fs.readFileSync(
				`${SPEC_CODEGEN_TEST_SAMPLES_PATH}/${name}/input.hine`,
				'utf-8',
			),
		},
	};
}
