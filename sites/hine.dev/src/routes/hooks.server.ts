import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async (x) => {
	return x;
};
