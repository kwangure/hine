---
"hine": patch
---

Changed the semantics of `Context.set()` to match the semantics of `Context.get()`.
Instead of creating a new key on the current state, if the key is missing it walks
up the tree to find the closest ancestor state with that key and updates. It throws
an error if the key is not found. Therefore, you can not create new keys in context.

To match this shift in behaviour to the name, `Context.set()` has been renamed to
`Context.update()`. Use an object as a value to store arbitrary key-value data.

This change brings type safety to `Context.get()` and `Context.update()`.
