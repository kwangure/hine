---
title: AtomicState
group: states
---

## Overview

`AtomicState`{lang=js} is the most basic state type in a state machine tree. The class
is used to represent simple, standalone states that do not contain any child
states.

The class extends [`BaseState`{lang=js}](/reference/basestate), inheriting its properties and methods,
to implement states that cannot be decomposed further into substates.
