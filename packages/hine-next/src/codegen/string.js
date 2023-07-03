const whitespace_RE = /\S/;

/**
 * @param {string} str
 */
export function dedent(str) {
	// Split the string into lines
	const lines = str.split('\n');

	// Determine the common indentation by finding the minimum indentation of non-empty lines
	let commonIndentation = Infinity;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line.length > 0) {
			const indentation = lines[i].search(whitespace_RE);
			commonIndentation = Math.min(commonIndentation, indentation);
		}
	}

	// Dedent each line by removing the common indentation
	const dedentedLines = lines.map((line) => {
		if (line.trim().length === 0) {
			// Skip empty lines
			return line;
		} else {
			return line.substring(commonIndentation);
		}
	});

	// Join the lines back into a single string
	const dedentedString = dedentedLines.join('\n');

	return dedentedString;
}
