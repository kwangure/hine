---
'hine': patch
---

Move conditions from pattern to monitor.

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
