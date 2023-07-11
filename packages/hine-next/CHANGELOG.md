# hine-next

## 0.0.1

### Patch Changes

- 5356ca7: Compile to from HTMLx to JS

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

- 5b7a18c: Compile a simple monitor with entry actions
- 96e0db0: Implemented atomic entry actions in the runtime.

  ```javascript
  let event = 'noEvent';
  const state = new AtomicState();
  state.monitor({
  	actions: {
  		logEntry: new Action({
  			run: () => (event = 'entryEvent'),
  		}),
  	},
  	entry: [
  		{
  			actions: ['logEntry'],
  		},
  	],
  });
  state.start();
  console.log(event); // "entryEvent"
  ```

- Updated dependencies [07603ed]
- Updated dependencies [0fd1384]
- Updated dependencies [4e7791e]
- Updated dependencies [e9c6170]
  - parserer@0.0.4
