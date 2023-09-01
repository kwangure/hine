import {
	drizzleIntegerColumn,
	drizzlePrimaryKeyConfig,
	drizzleTextColumn,
	markdownConfigSchema,
	yamlConfigSchema,
} from './load.js';
import path from 'node:path';
import { write } from '@content-thing/internal-utils/filesystem';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

const output = path.join(process.cwd(), 'config/schema.json');

const jsonSchemaString = {
	$schema: z.string().optional(),
};

const configSchema = z.discriminatedUnion('type', [
	markdownConfigSchema.extend(jsonSchemaString),
	yamlConfigSchema.extend(jsonSchemaString),
]);

const jsonSchema = zodToJsonSchema(configSchema, {
	definitions: {
		markdownConfig: markdownConfigSchema,
		yamlConfig: yamlConfigSchema,
		fieldPrimaryKey: drizzlePrimaryKeyConfig,
		integerField: drizzleIntegerColumn,
		textField: drizzleTextColumn,
	},
});

write(output, JSON.stringify(jsonSchema, null, 4));
