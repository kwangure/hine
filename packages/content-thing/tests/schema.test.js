import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
	generateTextColumnCode,
	generateIntegerColumnCode,
	generateMarkdownSchema,
	generateYamlSchema,
} from '../src/db/schema.js';

describe('generateTextColumnCode', () => {
	it('generates code for text column with no options', () => {
		const result = generateTextColumnCode('name', { type: 'text' });
		assert.strictEqual(result, "text('name')");
	});

	it('generates code for text column with length', () => {
		const result = generateTextColumnCode('name', { type: 'text', length: 50 });
		assert.strictEqual(result, 'text(\'name\', {"length":50})');
	});

	it('generates code for text column with enum', () => {
		const result = generateTextColumnCode('name', {
			type: 'text',
			enum: ['a', 'b'],
		});
		assert.strictEqual(result, 'text(\'name\', {"enum":["a","b"]})');
	});

	it('generates code for text column with default value', () => {
		const result = generateTextColumnCode('name', {
			type: 'text',
			defaultValue: 'abc',
		});
		assert.strictEqual(result, 'text(\'name\').default("abc")');
	});

	it('generates code for text column as primary key', () => {
		const result = generateTextColumnCode('name', {
			type: 'text',
			primaryKey: true,
		});
		assert.strictEqual(result, "text('name').primaryKey()");
	});

	it('should generate text column code with all options', () => {
		const key = 'name';
		/** @type {import('../src/db/types.js').CTText} */
		const column = {
			type: 'text',
			length: 50,
			enum: ['value1', 'value2'],
			defaultValue: 'value1',
			primaryKey: true,
		};
		const expected = `text('name', {"length":50,"enum":["value1","value2"]}).default("value1").primaryKey()`;
		assert.strictEqual(generateTextColumnCode(key, column), expected);
	});

	it('should generate text column code with minimal options', () => {
		const key = 'name';
		/** @type {import('../src/db/types.js').CTText} */
		const column = {
			type: 'text',
		};
		const expected = `text('name')`;
		assert.strictEqual(generateTextColumnCode(key, column), expected);
	});
});

describe('generateIntegerColumnCode', () => {
	it('generates code for integer column with no options', () => {
		const result = generateIntegerColumnCode('age', { type: 'integer' });
		assert.strictEqual(result, "integer('age')");
	});

	it('generates code for integer column with mode', () => {
		const result = generateIntegerColumnCode('age', {
			type: 'integer',
			mode: 'timestamp',
		});
		assert.strictEqual(result, 'integer(\'age\', {"mode":"timestamp"})');
	});

	it('generates code for integer column with default value', () => {
		const result = generateIntegerColumnCode('age', {
			type: 'integer',
			defaultValue: 25,
		});
		assert.strictEqual(result, "integer('age').default(25)");
	});

	it('generates code for integer column as primary key', () => {
		const result = generateIntegerColumnCode('age', {
			type: 'integer',
			primaryKey: true,
		});
		assert.strictEqual(result, "integer('age').primaryKey()");
	});

	it('should generate integer column code with all options', () => {
		const key = 'age';
		/** @type {import('../src/db/types.js').CTInteger} */
		const column = {
			type: 'integer',
			mode: 'timestamp',
			defaultValue: 0,
			primaryKey: true,
		};
		const expected = `integer('age', {"mode":"timestamp"}).default(0).primaryKey()`;
		assert.strictEqual(generateIntegerColumnCode(key, column), expected);
	});

	it('should generate integer column code with minimal options', () => {
		const key = 'age';
		/** @type {import('../src/db/types.js').CTInteger} */
		const column = {
			type: 'integer',
		};
		const expected = `integer('age')`;
		assert.strictEqual(generateIntegerColumnCode(key, column), expected);
	});
});

describe('generateMarkdownSchema', () => {
	it('should generate markdown schema', () => {
		/** @type {import('../src/db/types.js').CTMarkdownSchema} */
		const config = {
			frontmatter: {
				title: {
					type: 'text',
				},
				age: {
					type: 'integer',
				},
			},
		};
		const tableName = 'testTable';
		const expected =
			"import { json } from 'content-thing/db';\n" +
			`import { integer, sqliteTable, text } from 'content-thing/drizzle-orm/sqlite-core';\n\n` +
			`export const testTable = sqliteTable('testTable', {\n` +
			`\tid: text('id').primaryKey(),\n` +
			`\tdata_title: text('data_title'),\n` +
			`\tdata_age: integer('data_age'),\n` +
			"\tcontent: /** @type {ReturnType<typeof json<import('content-thing/mdast').Root, 'content'>>} */(json('content')),\n" +
			`});\n`;
		assert.strictEqual(generateMarkdownSchema(config, tableName), expected);
	});
	it('throws error for unsupported column types', () => {
		/** @type {import('../src/db/types.js').CTMarkdownSchema} */
		const config = {
			frontmatter: {
				title: {
					// @ts-expect-error
					type: 'unsupported',
				},
			},
		};
		assert.throws(
			() => generateMarkdownSchema(config, 'MyTable'),
			/Unsupported column type in schema/,
		);
	});
});

describe('generateYamlSchema', () => {
	it('should generate yaml schema', () => {
		/** @type {import('../src/db/types.js').CTYamlSchema} */
		const config = {
			title: {
				type: 'text',
			},
			age: {
				type: 'integer',
			},
		};
		const tableName = 'testTable';
		const expected =
			`import { sqliteTable, integer, text } from 'content-thing/drizzle-orm/sqlite-core';\n\n` +
			`export const testTable = sqliteTable('testTable', {\n` +
			`\tid: text('id').primaryKey(),\n` +
			`\tdata_title: text('data_title'),\n` +
			`\tdata_age: integer('data_age'),\n` +
			`});\n`;
		assert.strictEqual(generateYamlSchema(config, tableName), expected);
	});
	it('throws error for unsupported YAML column type', () => {
		/** @type {import('../src/db/types.js').CTYamlSchema} */
		const config = {
			title: {
				// @ts-expect-error
				type: 'unsupported',
			},
		};
		assert.throws(
			() => generateYamlSchema(config, 'MyTable'),
			/Unsupported column type in schema/,
		);
	});
});
