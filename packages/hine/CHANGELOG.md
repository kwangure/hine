# hine

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
