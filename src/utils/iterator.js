/**
 * @template T
 * @template U
 * @param {Iterable<T>} iter1
 * @param {Iterable<U>} iter2
 * @returns {Generator<[T, U]>}
 */
export function* zip(iter1, iter2) {
	const iterator1 = iter1[Symbol.iterator]();
	const iterator2 = iter2[Symbol.iterator]();
	let result1 = iterator1.next();
	let result2 = iterator2.next();
	while (!result1.done && !result2.done) {
		yield [result1.value, result2.value];
		result1 = iterator1.next();
		result2 = iterator2.next();
	}
}
