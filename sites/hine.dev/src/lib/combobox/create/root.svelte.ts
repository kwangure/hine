export interface ComboboxRootConfig {
	operations: {
		close(): void;
	};
}

function onclickoutside(node: HTMLElement) {
	function onclick(event: Event) {
		if (!node.contains(event.target as Node)) {
			const clickoutside = new Event('clickoutside', event);
			node.dispatchEvent(clickoutside);
		}
	}
	document.body.addEventListener('click', onclick);
	return {
		destroy() {
			document.body.removeEventListener('click', onclick);
		},
	};
}

export function createComboboxRoot(config: ComboboxRootConfig) {
	return {
		action: onclickoutside,
		properties: {
			onclickoutside() {
				config.operations.close();
			},
		},
	};
}
