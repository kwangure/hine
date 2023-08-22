export interface GroupEntry {
	children: GroupEntry[];
	hash: string;
	id: string;
	depth: 1 | 2 | 3;
	path: string;
	value: string;
}

export interface Document {
	title: string;
	path: string;
	order: number;
	children: GroupEntry[];
}
