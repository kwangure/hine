import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

export const drizzlePrimaryKeyConfig = z.object({
	autoIncrement: z.boolean().optional(),
	onConflict: z
		.enum(['abort', 'fail', 'ignore', 'replace', 'rollback'])
		.optional(),
});

export const drizzleIntegerColumn = z.object({
	type: z.literal('integer'),
	mode: z.enum(['boolean', 'number', 'timestamp', 'timestamp_ms']).optional(),
	primaryKey: drizzlePrimaryKeyConfig.optional(),
	defaultValue: z.number().optional(),
});

export const drizzleTextColumn = z.object({
	type: z.literal('text'),
	enum: z.string().array().optional(),
	length: z.number().optional(),
	primaryKey: drizzlePrimaryKeyConfig.optional(),
	defaultValue: z.string().optional(),
});

export const drizzleOneRelation = z.object({
	type: z.literal('one'),
	collection: z.string(),
	reference: z.string(),
	field: z.string(),
});

export const drizzleManyRelation = z.object({
	type: z.literal('many'),
	collection: z.string(),
});

export const markdownConfigSchema = z.object({
	type: z.literal('markdown'),
	schema: z.object({
		frontmatter: z
			.record(
				z.discriminatedUnion('type', [drizzleIntegerColumn, drizzleTextColumn]),
			)
			.optional(),
	}),
	relations: z
		.record(
			z.discriminatedUnion('type', [drizzleOneRelation, drizzleManyRelation]),
		)
		.optional(),
});

export const yamlConfigSchema = z.object({
	type: z.literal('yaml'),
	schema: z.record(
		z.discriminatedUnion('type', [drizzleIntegerColumn, drizzleTextColumn]),
	),
	relations: z
		.record(
			z.discriminatedUnion('type', [drizzleOneRelation, drizzleManyRelation]),
		)
		.optional(),
});

export const configSchema = z.discriminatedUnion('type', [
	markdownConfigSchema,
	yamlConfigSchema,
]);

/** @param {string} directory */
export function loadCollectionConfig(directory) {
	const configPath = path.join(directory, 'collection.config.json');
	try {
		const configContent = fs.readFileSync(configPath, 'utf-8');
		const configJSON = JSON.parse(configContent);
		return configSchema.parse(configJSON);
	} catch (_error) {
		if (/** @type {any} */ (_error).code === 'ENOENT') {
			const error = new Error(
				`Could not find a config file at ${configPath}. All collections must have one.`,
			);
			error.cause = _error;
			throw error;
		} else {
			throw _error;
		}
	}
}
