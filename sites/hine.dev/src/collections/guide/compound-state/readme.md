---
title: Compound States
group: states
---

In a heirarchy of states, compound states are parents. They contain
[atomic](/guide/atomic-state), [parallel](/guide/parallel-state) or other
compound states.

## Usage

Use `compound(...)`{lang=js} to create state configuration and
`resolveState(...)`{lang=js} to initialize it.

```javascript {file=./01-usage.js copy}

```

## Active Children

Active states are those that can receive and handle emitted events at a
particular time. Compound states have exactly one active child state. This is in
contrast to [parallel states](/guide/parallel-state), where all children are
simultaneously active, and [atomic states](/guide/atomic-state) which have no
children.

```javascript {file=./02-active-children.js#L17 copy}

```

## Children

Compound states must have at least one child and specify the initial active
child when the state is initialized.

```javascript {file=./03-children.js#L17 copy}

```

# Hooks

Compound states accept hooks such as `afterEntry`{lang=js} and
`beforeExit`{lang=js}. Hooks respond to life-cycle events of a state.

```javascript {file=./04-hooks.js copy}

```

When `toggleState`{lang=js} receives a `'toggle'`{lang=js} event while inactive,
it will transition to the active state and log `'active start'`{lang=js}. When
`toggleState`{lang=js} then transitions out of the active state, it will log
`'active end'`{lang=js}.
