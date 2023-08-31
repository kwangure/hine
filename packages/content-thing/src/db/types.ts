interface DrizzlePrimaryKeyConfig {
	autoIncrement?: boolean;
	onConflict?: 'abort' | 'fail' | 'ignore' | 'replace' | 'rollback';
}

interface DrizzleColumn {
	primaryKey?: boolean | DrizzlePrimaryKeyConfig;
}

export interface CTInteger extends DrizzleColumn {
	type: 'integer';
	mode?: 'boolean' | 'number' | 'timestamp' | 'timestamp_ms';
	defaultValue?: number;
}

export interface CTText extends DrizzleColumn {
	type: 'text';
	enum?: string[];
	length?: number;
	defaultValue?: string;
}

export interface CTMarkdownSchema {
	frontmatter?: {
		[x: string]: CTInteger | CTText;
	};
}

export interface CTYamlSchema {
	[x: string]: CTInteger | CTText;
}

export type CTSchema = CTMarkdownSchema | CTYamlSchema;

export interface CTOneRelation {
	type: 'one';
	collection: string;
	reference: string;
	field: string;
}

export interface CTManyRelation {
	type: 'many';
	collection: string;
}

export interface CTRelations {
	[x: string]: CTOneRelation | CTManyRelation;
}
