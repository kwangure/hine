---
'hine': patch
---

Throw when accessing `ownerState` in actions and conditions before initialisation.
This also means `ownerState` never `null` so you don't need to check it to quite
TypeScript errors.
