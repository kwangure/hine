# parserer

## 0.0.4

### Patch Changes

- 07603ed: Implement nesting block statement inside elements. The following is now possible:

  ```svelte
  <div>
  	{#if true}{/if}
  </div>
  ```

- 0fd1384: Parse style and script tags as static tags. Prevent Parserer from trying to parse mustaches.
- 4e7791e: Enable using forward slash in attribute quoted values. Parserer was not able to parse the following before:

  ```html
  <input value="/" />
  ```

- e9c6170: Implement nesting block statement inside elements. The following is now possible:

  ```svelte
  <div>
  	{#if true}{/if}
  </div>
  ```
