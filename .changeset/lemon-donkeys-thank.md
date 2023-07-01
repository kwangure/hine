---
'hine-next': patch
---

Compile to from HTMLx to JS

```html
<on>
	<event name="event1" action="action1" />
</on>
```

Compiles to

```javascript
import { State } from 'hine-next';
const config = {
	on: {
		event1: [
			{
				actions: ['action1'],
			},
		],
	},
};

export default class Machine extends State {
	constructor() {
		super(config);
	}
}
```
