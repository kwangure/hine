export interface Doc {
	type: string;
	docs: {
		description: string;
	};
};
export interface ClassDoc extends Doc {
	type: 'ClassDeclaration';
};
export interface FunctionDoc extends Doc {
	type: 'FunctionDeclaration';
};
export interface TypeDoc extends Doc {
	type: 'TypeAliasDeclaration';
};
