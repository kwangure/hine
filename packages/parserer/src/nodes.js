export class PAttribute {
	#type = /** @type {const} */ ('Attribute');
	end = 0;
	name = '';
	start = 0;
	value = /** @type {true | (PMustache | PShorthand | PText)[]} */ (true);
	/**
	 * @param {PMustache | PShorthand | PText} node
	 */
	append(node) {
		switch (node.type) {
			case 'Mustache':
			case 'AttributeShorthand':
			case 'Text':
				this.value = [node];
				break;
			default:
				throw Error(`Attribute nodes do not take '${node}' as a child.`);
		}
	}
	clear() {
		this.end = 0;
		this.name = '';
		this.start = 0;
		this.value = true;
	}
	/** @returns {import("./types").PAttributeJSON} */
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			name: this.name,
			value: Array.isArray(this.value)
				? this.value.map((value) => value.toJSON())
				: this.value,
		};
	}
	get type() {
		return this.#type;
	}
}

export class PBlock {
	#type = /** @type {const} */ ('Block');
	/** @type {PBlockStatement[]} */
	children = [];
	end = 0;
	start = 0;

	/**
	 * @param {PBlockStatement} node
	 */
	append(node) {
		switch (node.type) {
			case 'BlockStatement':
				this.children.push(node);
				break;
			default:
				throw Error(`Block nodes do not take '${node}' as a child.`);
		}
	}
	clear() {
		this.end = 0;
		this.start = 0;
		this.children.length = 0;
	}
	/** @returns {import("./types").PBlockJSON} */
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			children: this.children?.map((child) => child.toJSON()),
		};
	}
	get type() {
		return this.#type;
	}
}

export class PBlockStatement {
	/** @type {import("./types").PBlockStatementChild[]} */
	#children = [];
	#type = /** @type {const} */ ('BlockStatement');
	end = 0;
	name = '';
	raw = '';
	start = 0;

	/** @param {import("./types").PBlockStatementChild} node */
	append(node) {
		switch (node.type) {
			case 'Block':
			case 'Mustache':
			case 'Element':
			case 'Text':
				this.#children.push(node);
				break;
			default:
				throw Error(`BlockStatement nodes do not take '${node}' as a child.`);
		}
	}
	clear() {
		this.end = 0;
		this.start = 0;
		this.#children.length = 0;
	}
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			name: this.name,
			raw: this.raw,
			children: this.#children?.map((child) => child.toJSON()),
		};
	}
	get type() {
		return this.#type;
	}
}

export class PElement {
	/** @type {PAttribute[]} */
	#attributes = [];
	/** @type {import("./types").PTemplateNode[]} */
	#children = [];
	#type = /** @type {const} */ ('Element');
	end = 0;
	name = '';
	start = 0;
	/**
	 * @param {PAttribute | PBlock | PElement | PMustache | PText} node
	 */
	append(node) {
		switch (node.type) {
			case 'Attribute':
				this.#attributes.push(node);
				break;
			case 'Element': {
				this.#children.push(node);
				break;
			}
			case 'Text': {
				const lastChild = this.#children.at(-1);
				if (lastChild?.type === 'Text') {
					lastChild.end = node.end;
					lastChild.raw += node.raw;
				} else {
					this.#children.push(node);
				}
				break;
			}
			default:
				throw Error(`Element nodes do not take '${node}' as a child.`);
		}
	}
	clear() {
		this.end = 0;
		this.name = '';
		this.start = 0;
		this.#attributes.length = 0;
		this.#children.length = 0;
	}
	/** @returns {import("./types").PElementJSON} */
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			name: this.name,
			attributes: this.#attributes.map((attribute) => attribute.toJSON()),
			children: this.#children?.map((child) => child.toJSON()),
		};
	}
	get type() {
		return this.#type;
	}
}

export class PFragment {
	/** @type {import("./types").PTemplateNode[]} */
	#children = [];
	#type = /** @type {const} */ ('Fragment');
	end = 0;
	start = 0;
	/**
	 * @param {PBlock | PElement | PMustache | PText} node
	 */
	append(node) {
		switch (node.type) {
			case 'Block':
			case 'Element':
			case 'Mustache':
			case 'Text': {
				this.#children.push(node);
				break;
			}
			default:
				throw Error(`Fragment nodes do not take '${node}' as a child.`);
		}
	}
	clear() {
		this.end = 0;
		this.start = 0;
		this.#children.length = 0;
	}
	/** @returns {import("./types").PFragmentJSON} */
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			children: this.#children?.map((child) => child.toJSON()),
		};
	}
	get type() {
		return this.#type;
	}
}

export class PMustache {
	#type = /** @type {const} */ ('Mustache');
	end = 0;
	raw = '';
	start = 0;
	clear() {
		this.end = 0;
		this.raw = '';
		this.start = 0;
	}
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			raw: this.raw,
		};
	}
	get type() {
		return this.#type;
	}
}

export class PText {
	#type = /** @type {const} */ ('Text');
	end = 0;
	raw = '';
	start = 0;
	clear() {
		this.end = 0;
		this.raw = '';
		this.start = 0;
	}
	toJSON() {
		return {
			type: this.type,
			start: this.start,
			end: this.end,
			raw: this.raw,
		};
	}
	get type() {
		return this.#type;
	}
}

export class PShorthand {
	#type = /** @type {const} */ ('AttributeShorthand');
	end = 0;
	raw = '';
	start = 0;
	clear() {
		this.end = 0;
		this.raw = '';
		this.start = 0;
	}
	toJSON() {
		return {
			type: this.#type,
			start: this.start,
			end: this.end,
			raw: this.raw,
		};
	}
	get type() {
		return this.#type;
	}
}
