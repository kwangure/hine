// TODO: Delete once https://github.com/withfig/lezer-bash/pull/2 is released 🙄
declare module '@fig/lezer-bash' {
	import { LRParser } from '@lezer/lr';

	export const parser: LRParser;
}
