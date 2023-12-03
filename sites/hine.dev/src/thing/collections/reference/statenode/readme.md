---
title: StateNode
group: types
---

## Overview

`StateNode`{lang=js} is a utility union type that can be either an [`AtomicState`{lang=js}](/reference/atomicstate), [`CompoundState`{lang=js}](/reference/compoundstate), or [`ParallelState`{lang=js}](/reference/parallelstate).

- [`AtomicState`{lang=js}](/reference/atomicstate): Represents the most basic, indivisible state, which does not contain any child states.
  Used for simple, standalone states in the state machine.
- [`CompoundState`{lang=js}](/reference/compoundstate): Represents a complex state that can contain nested states, including atomic and other compound states.
  Useful for representing states with multiple levels of nested substates.
- [`ParallelState`{lang=js}](/reference/parallelstate): Represents a state where all child states are active simultaneously,
  allowing for concurrent state behaviors. Different from compound states, where only one child state is active at a time.
