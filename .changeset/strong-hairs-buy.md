---
'hine': patch
---

Require passing handler instances as event listeners

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
