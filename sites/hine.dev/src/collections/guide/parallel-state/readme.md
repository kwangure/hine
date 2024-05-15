---
title: Parallel States
group: states
---

In a heirarchy of states, parallel states are parents. They contain
[atomic](/guide/atomic-state), [compound](/guide/parallel-state) or other
parallel states.

## Usage

Use `parallel(...)`{lang=js} to create state configuration and
`resolveState(...)`{lang=js} to initialize it.

```javascript {file=./01-usage.js copy}

```

In this example, `playerState`{lang=js} is set to increment both
`health`{lang=js} _and_ `position`{lang=js} by `1`{lang=js} each time an
`'advance'`{lang=js} event is emitted.

## Active Children

Active states are those that can receive and handle emitted events at a
particular time. All children in a parallel state are active.

```javascript {file=./02-active-children.js#L18 copy}

```

# Hooks

Parallel states accept hooks such as `afterEntry`{lang=js} and
`beforeExit`{lang=js}. Hooks respond to life-cycle events of a state.

```javascript {file=./04-hooks.js copy}

```

When `playerState`{lang=js} is resolved, it will _enter_ the `'health'`{lang=js}
and `'position'`{lang=js} states simulatenously and initialize both
`health`{lang=js} and `position`{lang=js} to `10`{lang=js}.
