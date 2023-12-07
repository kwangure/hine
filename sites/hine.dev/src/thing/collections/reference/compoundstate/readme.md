---
title: CompoundState
group: states
---

## Overview

`CompoundState`{lang=js} is a specialized type of state in a state machine tree. It can
contain nested states, including both atomic states and other compound states,
allowing for the representation of complex state hierarchies and behaviors
within the state machine.

The class extends [`ParentState`{lang=js}](/reference/parentstate), inheriting its
properties and methods, to implement the the ability to contain and manage a
hierarchy of nested states.

`CompoundState`{lang=js} is particularly useful for modeling scenarios where states have
multiple levels of nested substates.
