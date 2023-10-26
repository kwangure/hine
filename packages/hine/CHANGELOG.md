# hine

## 0.0.21

### Patch Changes

- c8a2b04: Run entry actions and subscriptions on append.

## 0.0.20

### Patch Changes

- ff0cc20: Changed `Context` to use types instead of transformers to infer values

  Before:

  ```js
  import { state } from 'hine';

  const foo = state({
  	context: {
  		key1: String,
  		key2: Number,
  	},
  });
  ```

  After:

  ```ts
  import { state } from 'hine';

  const foo = state({
  	types: {
  		context: {} as {
  			key1: string;
  			key2: number;
  		},
  	},
  });
  ```

## 0.0.19

### Patch Changes

- b66039f: Changed the semantics of `Context.set()` to match the semantics of `Context.get()`.
  Instead of creating a new key on the current state, if the key is missing it walks
  up the tree to find the closest ancestor state with that key and updates. It throws
  an error if the key is not found. Therefore, you can not create new keys in context.

  To match this shift in behaviour to the name, `Context.set()` has been renamed to
  `Context.update()`. Use an object as a value to store arbitrary key-value data.

  This change brings type safety to `Context.get()` and `Context.update()`.

- b66039f: Change Hine to accept an action config instead of an action runner.

  Before:

  ```javascript
  import { h } from 'hine';

  state.resolve({
  	context: h.context({
  		foo: 'bar',
  		baz: 10,
  	}),
  });
  ```

  After:

  ```javascript
  state.resolve({
  	context: {
  		foo: 'bar',
  		baz: 10,
  	},
  });
  ```

  You no longer need the helper. Only the data you'd previously pass to it.

- b66039f: Change Hine to accept an action config instead of an action runner.

  Before:

  ```javascript
  import { h } from 'hine';

  state.resolve({
  	actions: {
  		action: h.action(({ context }) => {
  			console.log({ context });
  		}),
  	},
  });
  ```

  After:

  ```javascript
  state.resolve({
  	actions: {
  		action: ({ context }) => {
  			console.log({ context });
  		},
  	},
  });
  ```

  You no longer need the helper. Only the config, you'd previously pass to it.

## 0.0.18

### Patch Changes

- 65d725e: Rename the `states` used to define child states in a state config to `children`.
- 65d725e: Consolidate `h.effect()` and `h.transition()` into a unified helper `h.handler()`.
- 65d725e: Consolidate `h.compound()` and `h.atomic()` into a unified helper `h.state()`.

## 0.0.17

### Patch Changes

- 7e622cc: Pass event values through `StateEvent{}` on states instead of drilling them
  down through function call args

  Before:

  ```javascript
  const state = new AtomicState({
  	on: {
  		myEvent: [{ actions: ['action'] }],
  	},
  });
  state.monitor({
  	actions: {
  		action: new Action({
  			run({ ownerState, value }) {
  				console.log(value); // 'myValue';
  			},
  		}),
  	},
  });
  state.start();
  state.dispatch('myEvent', 'myValue');
  ```

  After:

  ```javascript
  const state = new AtomicState({
  	on: {
  		myEvent: [{ actions: ['action'] }],
  	},
  });
  state.monitor({
  	actions: {
  		action: new Action({
  			run({ ownerState, event }) {
  				console.log(ownerState.event === event); // true
  				console.log(event.name); // 'myEvent';
  				console.log(event.value); // 'myValue';
  			},
  		}),
  	},
  });
  state.start();
  state.dispatch('myEvent', 'myValue');
  ```

- e626638: Return nothing from calling `state.start()` and remove `stateEventNames` helper.
- 809f89d: Require passing handler instances as event listeners

  Before:

  ```javascript
  const state = h.atomic({
  	entry: [{ actions: ['action'] }],
  });
  ```

  After:

  ```javascript
  const state = h.atomic({
  	entry: [h.effect({ run: ['action'] })],
  });
  ```

## 0.0.16

### Patch Changes

- 2c1f481: Add `isActiveEvent` to check single events

  ```javascript
  const state = new AtomicState({
  	on: {
  		EVENT: [
  			{
  				actions: ['action'],
  			},
  		],
  	},
  });
  state.monitor({
  	actions: {
  		action: new Action({ run() {} }),
  	},
  });
  state.start();

  console.log(state.isActiveEvent('EVENT')); // true
  ```

  This is faster than `state.activeEvents.includes("EVENT")` which walks the entire tree
  first even when it doesn't need to.

- 2c1f481: Expose list of active handled events via `state.activeEvents`

  ```javascript
  const state = new AtomicState({
  	on: {
  		EVENT: [
  			{
  				actions: ['action'],
  			},
  		],
  	},
  });
  state.monitor({
  	actions: {
  		action: new Action({ run() {} }),
  	},
  });
  state.start();
  console.log(state.activeEvents); // ["EVENT"];
  ```

- 2c1f481: Add a `canTransitioTo` to check possible transitions

  ```javascript
  const state = new CompoundState({
  	name: 's0',
  	states: {
  		s1: new AtomicState({
  			on: {
  				EVENT: [
  					{
  						transitionTo: 's2',
  					},
  				],
  			},
  		}),
  		s2: new AtomicState(),
  	},
  });
  state.start();

  console.log(state.canTransitionTo('s0.s2')); // true
  ```

## 0.0.15

### Patch Changes

- eea1f88: Move `actionConfig` and `conditionConfig` to monitor
- eea1f88: Make context non-nullable. Before you had to check that context was not null.
  Now you don't. It always exists but may be empty.

  ```javascript
  conditions: {
  	condition: h.condition(({ ownerState }) => {
  		ownerState?.context?.set('key', 'value');
  					//     ^  ? no longer needed
  	}),
  },
  ```

- eea1f88: Move conditions from pattern to monitor.

  Before:

  ```javascript
  const state = new AtomicState({
    conditions: {
      condition: new Condition({ run: =>  true }),
    },
  });
  state.monitor({ ... });
  ```

  After:

  ```javascript
  const state = new AtomicState({ ... });
  state.monitor({
    conditions: {
      condition: new Condition({ run: =>  true }),
    },
  });
  ```

## 0.0.14

### Patch Changes

- 5a6e11b: Throw when accessing `ownerState` in actions and conditions before initialisation.
  This also means `ownerState` never `null` so you don't need to check it to quite
  TypeScript errors.

## 0.0.13

### Patch Changes

- e14056d: Added context to states. This allows you to pass information to nested states
  without drilling arguments through functions. You can access context state
  from actions and conditions.

  ```javascript
  const state = h.compound({
  	context: h.context({ key: 'value' }),
  	states: {
  		state: h.atomic(({
  			actions: {
  				action: h.action(({ ownerState }) => {
  					console.log(ownerState.context.get('key')); // "value"
  				}),
  			},
  		}));,
  	},
  });
  ```

## 0.0.12

### Patch Changes

- aec2bb5: Hine now requires that action definitions as well entry and exit actions be defined in an external
  monitor. This allows you create different side-effect implementations for the same state machine!

  Before:

  ```javascript
  const state = h.atomic({
  	actions: {
  		action: h.action(() => console.log('action!')),
    	}
    	entry: [{ actions: ['action'] }],
  });
  ```

  After:

  ```javascript
  const state = h.atomic();
  state.monitor({
  	actions: {
  		action: h.action(() => console.log('action!')),
  	}
  	entry: [{ actions: ['action'] }],
  });
  ```
