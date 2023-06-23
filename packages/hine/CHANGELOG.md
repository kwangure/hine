# hine

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
