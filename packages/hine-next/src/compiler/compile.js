import { createParser } from 'parserer/parser';

export function compile() {
	const parser = createParser();
	console.log({ parser });
}
