---
'parserer': patch
---

Enable using forward slash in attribute quoted values. Parserer was not able to parse the following before:

```html
<input value="/" />
```
