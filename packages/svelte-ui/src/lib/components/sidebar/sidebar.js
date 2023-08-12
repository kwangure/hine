import { getContext, setContext, tick } from 'svelte';
import { focustrap } from '../../actions/focustrap.js';
import { writable } from 'svelte/store';

export function createSidebar() {
	/** @typedef {'hidden' | 'hiding' | 'shown' | 'showing'} Status */
	const visibility = writable(/** @type {Status} */ ('hidden'));
	const { set, subscribe } = visibility;

	const setHidden = () => set('hidden');
	const setShown = () => set('shown');

	/**
	 * @param {HTMLElement} node
	 * @param {{ focus?: boolean }} [options]
	 */
	function show(node, options) {
		node.addEventListener('click', setShown);

		let { focus = false } = options || {};
		const unsubscribe = visibility.subscribe(async ($visibility) => {
			if ($visibility === 'hidden' && focus) {
				// wait for hidden DOM to update w/ new visiblity
				await tick();
				node.focus();
			}
		});

		return {
			/** @param {typeof options} _options */
			update(_options) {
				({ focus = false } = _options || {});
			},
			destroy() {
				unsubscribe();
				node.removeEventListener('click', setShown);
			},
		};
	}

	/**
	 * @param {HTMLElement} node
	 * @param {{ focus?: boolean }} [options]
	 */
	function hide(node, options) {
		node.addEventListener('click', setHidden);

		let { focus = false } = options || {};
		const unsubscribe = visibility.subscribe(async ($visibility) => {
			if ($visibility === 'shown' && focus) {
				// wait for hidden DOM to update w/ new visiblity
				await tick();
				node.focus();
			}
		});

		return {
			/** @param {typeof options} _options */
			update(_options) {
				({ focus = false } = _options || {});
			},
			destroy() {
				unsubscribe();
				node.removeEventListener('click', setHidden);
			},
		};
	}

	return {
		elements: { hide, show, panel: focustrap },
		state: {
			visibility: { subscribe },
		},
	};
}

const CONTEXT_KEY = '__SIDEBAR__';

export function getSidebarContext() {
	return /** @type {ReturnType<typeof createSidebar>} */ (
		getContext(CONTEXT_KEY)
	);
}

export function setSidebarContext() {
	setContext(CONTEXT_KEY, createSidebar());
}
