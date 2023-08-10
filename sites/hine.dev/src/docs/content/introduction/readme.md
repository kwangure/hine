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

This defines the root state for our program. We will later interact with the
state machine by calling methods on the `checkboxState`{lang=js} object.

#### 2. Checkbox child states

Let's add the child checked and unchecked states to our state machine. Remember
that we use `atomic`{lang=js} because these states will have no nested child states.

```javascript {file=./02-checked-unchecked.js copy}

```

Because the `unchecked` state is listed first among the child states, it is the
initial state that the state machine will transition to when we initialise it.

#### 3. Checkbox State Transitions

We have added the necessary checkbox states above, but how do we switch between
them? We'll add event handlers that transition from one state to the other.

```javascript {file=./03-state-transitions.js copy}

```

#### 4. Subscribing to the Checkbox Machine

Now that we have a checkbox state machine, we need to listen to changes and run
it! We will call the `subscribe()`{lang=js} method with a subscriber function. The
function will be called with a reference to the `checkboxState`{lang=js} object every
time an event is dispatched to our machine.

```javascript {file=./04-state-subscriptions.js copy}

```

#### 5. Emitting Events to the Checkbox Machine

Now that we have a checkbox machine we can run it! We will call the
`.matches()`{lang=js} method to confirm the current state and
`.dispatch()`{lang=js} to change the current state.

```javascript {file=./05-dispatch.js copy}

```

---

There you have it! You now have everything you need to create a simple state
machine. By subscribing to the machine you can use it to emit side effects like
manipulating a checkbox on a web page or logging a state change to analytics.

As an added challenge, try implementing a counter with an active and inactive
state similar to the checked and unchecked states. It should only be possible
to increment the counter in the active state.
