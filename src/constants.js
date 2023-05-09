export const ACTION_NAME = Symbol('action-name');
export const ACTION_NOTIFY_AFTER = Symbol('action-notify-after');
export const ACTION_NOTIFY_BEFORE = Symbol('action-notify-before');
export const ACTION_OWNER = Symbol('action-owner');

export const HANDLER_NOTIFY_AFTER = Symbol('handler-notify-after');
export const HANDLER_NOTIFY_BEFORE = Symbol('handler-notify-before');
export const HANDLER_OWNER = Symbol('handler-owner');

export const CALL_SUBSCRIBERS = Symbol('call-subscribers');

export const CONDITION_NAME = Symbol('condition-name');
export const CONDITION_NOTIFY_AFTER = Symbol('condition-notify-after');
export const CONDITION_NOTIFY_BEFORE = Symbol('condition-notify-before');
export const CONDITION_OWNER = Symbol('condition-owner');

export const STATE_ACTIONS = Symbol('state-actions');
export const STATE_ACTION = Symbol('state-action');
export const STATE_ACTION_CONFIGS = Symbol('state-action-configs');
export const STATE_ACTIVE = Symbol('state-active');
export const STATE_CONDITIONS = Symbol('state-conditions');
export const STATE_CONDITION = Symbol('state-condition');
export const STATE_CONDITION_CONFIGS = Symbol('state-condition-configs');
export const STATE_HANDLER = Symbol('state-handler');
export const STATE_NAME = Symbol('state-name');
export const STATE_PARENT = Symbol('state-parent');
export const STATE_STATES = Symbol('state-states');
export const STATE_SUBSCRIBERS = Symbol('state-subscribers');

export const EXECUTE_HANDLERS = Symbol('execute-handlers');
export const EXECUTE_HANDLERS_LEAF_FIRST = Symbol('execute-handlers-leaf');
export const EXECUTE_HANDLERS_ROOT_FIRST = Symbol('execute-handlers-root');
export const FILTER_HANDLERS = Symbol('filter-handlers');
export const HANDLER_QUEUE = Symbol('handler-queue');
export const INITIALIZE = Symbol('initialize');
export const ON_HANDLER = Symbol('on');
export const RESOLVE_CONFIG = Symbol('resolve-config');
export const TO_JSON = Symbol('to-json');

export const QUEUE_ALWAYS_HANDLERS = Symbol('queue-always');
export const QUEUE_ENTRY_HANDLERS = Symbol('queue-entry');
export const QUEUE_EXIT_HANDLERS = Symbol('queue-exit');
export const QUEUE_ON_HANDLERS = Symbol('queue-on');
