---
title: ParallelState
group: states
---

## Overview

`ParallelState`{lang=js} is a type of state in a state machine tree that enables
simultaneous operations of its child states.
Unlike compound states, where only one child state is active at a time, in
a parallel state, all child states are active simultaneously, allowing for
modeling of concurrent state behaviors.

The class extends [`ParentState`{lang=js}](/reference/parentstate), inheriting its properties and methods.
It specifically facilitates the representation and management of states that
should operate in parallel, providing a powerful tool for scenarios where
multiple state processes need to run concurrently.
