---
title: Introduction
description: >
  Hine is a JavaScript library for building state machines. At its core, it is a
  set of functions that can be composed to model the behaviour of your application
  as a state machine.
---

# {{ frontmatter.title }}

## What is Hine?

{{ frontmatter.description }}

## What are state machines?

State machines describe whether and how a program should transition from one
state to another in response to an event. A state machine specifies all states
of a program, the transitions between them, as well as all the events that cause
those transitions. It simplifies programs that have complex control flow, ultimately
supercharging your ability to reason about your code.

## A state machine example

Let's build a state machine to get a concrete sense of how Hine and
state machines work.

### A checkbox state machine

A checkbox has 2 main states of interest: a checked and unchecked state. In
Hine, there are two kinds of primitives for modelling states:
`compound`{lang=javascript} states and `atomic`{lang=javascript} states. The
main difference between them is that `compound`{lang=javascript} states
can have nested states, while `atomic`{lang=javascript} states do not have
nested children.

#### 1. The Checkbox State

We'll start by importing the Hine `h` object and creating a compound state.

```javascript {file=./01-checkbox-state.js copy}

```
