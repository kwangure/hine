---
title: Atomic States
group: states
---

Atomic states are used as leaves of a state tree. They do not have children.

## Usage

Use `atomic(...)`{lang=js} to set up state configuration and
`resolveState(...)`{lang=js} to initialize it.

```javascript {file=./01-usage.js copy}

```

In this example, `counterState`{lang=js} is set up to increment `count`{lang=js}
by `1`{lang=js} each time an `'increment'`{lang=js} event is emitted.

## Active Children

Active states are those that can receive and handle emitted events at a
particular time. Atomic states themselves can handle events, but since they have
no children, they have zero active _child_ states.

They stand in contrast to [compound states](/guide/compound-state) which have
exactly one active child, and [parallel states](/guide/parallel-state), where
all children are simulataneously active.

```javascript {file=./02-active-children.js#L11 copy}

```

## Children

Atomic states have no children.

```javascript {file=./03-children.js#L11 copy}

```

## Hooks

Atomic states accept hooks such as `afterEntry`{lang=js} and
`beforeExit`{lang=js}. Hooks respond to life-cycle events of a state.

```javascript {file=./04-hooks.js copy}

```

When `counterState`{lang=js} is resolved, it will _enter_ the
`'counter'`{lang=js} state and initialize `count`{lang=js} to `0`{lang=js}.
