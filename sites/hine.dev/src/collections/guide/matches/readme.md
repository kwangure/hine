---
title: Matches
group: methods
---

## Overview

`matches(...)` is used to check if a given state node matches a specified path.
It's particularly useful for determining the current state of a state machine or
checking if a specific sub-state is active.

## Syntax

```js
function matches(state: StateNode, path: string): boolean;
```

## Parameters

-   `state`{lang=js} (StateNode): The current state node to check against.
-   `path`{lang=js} (string): A dot-separated string representing the path to
    match.

## Return Value

Returns `true`{lang=js} if the state matches the given path, `false`{lang=js}
otherwise.

## Description

The `matches(...)`{lang=js} function performs a recursive check to determine if
the given `state`{lang=js} matches the specified `path`{lang=js}. It works as
follows:

1. If the state's name exactly matches the path, it returns `true`{lang=js}.
2. If the path starts with the state's name followed by a dot, it checks the
   active children of the state.
3. For each active child, it recursively calls `matches`{lang=js} with the
   remaining part of the path.
4. If any active child matches, it returns `true`{lang=js}.
5. If no match is found, it returns `false`{lang=js}.

## Examples

```js {file=./01-example.js copy}

```

## Notes

-   The `path`{lang=js} string should use dot notation to represent nested
    states (e.g., `'parent.child.grandchild'`{lang=js}).
-   Be careful about using state names with a dot (`'.'`) in them. This may lead
    to false-positives.

    ```javascript {file=./02-false-positive.js fileRange='3-' copy}

    ```
