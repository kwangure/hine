---
title: Checkbox
group: examples
position: 1
---

## Parent State

We'll start by importing and creating a compound state.

```javascript {file=./01-checkbox-state.js copy}

```

This defines the root state for our program. We will later interact with the
state machine by calling methods on the `checkboxState`{lang=js} object.

## Child states

Let's add the child `checked` and `unchecked` p states to our state machine.

```javascript {file=./02-checked-unchecked.js copy}

```

Because the `unchecked` state is listed first among the child states, it is the
initial state that the state machine will transition to when we initialise it.

## State transitions

We have added the necessary checkbox states above, but how do we switch between
them? We'll add event handlers that transition from one state to the other.

```javascript {file=./03-state-transitions.js copy}

```

## Subscribing to changes

We can now run our checkbox state machine! We will call the `subscribe()`{lang=js}
method with a subscriber function. The function will be called with a reference to
the `checkboxState`{lang=js} object every time an event is dispatched to our machine.

```javascript {file=./04-state-subscriptions.js copy}

```

## Dispatching events

Now that we have a checkbox machine we can run it! We will call the
`.matches()`{lang=js} method to confirm the current state and
`.dispatch()`{lang=js} to change the current state.

```javascript {file=./05-dispatch.js copy}

```

---

There you have it! That's most of what you need to create a simple state
machine. By subscribing to the machine you can use it to emit side effects like
manipulating a checkbox on a web page or logging a state change to analytics.

As an added challenge, try implementing a counter with an active and inactive
state similar to the checked and unchecked states. It should only be possible
to increment the counter in the active state.
