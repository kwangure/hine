export type ActionIR = {
	name: string;
	value: string;
};

export type EntryIR = {
	name: string;
};

export type MonitorIR = {
	actions: ActionIR[];
	entry: EntryIR[];
	src: string;
};

export type ScriptIR = {
	content: string;
};

export type MonitorProgram = {
	script: ScriptIR;
	monitor: MonitorIR;
};
