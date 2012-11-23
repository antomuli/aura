// ## Permissions Extension
// @fileOverview Extend the aura-core permissions
define(['aura_perms'], function(permissions) {
  'use strict';

  permissions.extend({
    todos: {
      emit: ['bootstrap.todos', 'new-event', 'set-language'],
      on: ['bootstrap.todos', 'new-event', 'set-language']
    },
    calendar: {
      on: ['bootstrap.calendar', 'route.calendar.**'],
      emit: ['bootstrap.calendar']
    },
    controls: ['*'], // if emit and on is the same, just enter an array
    router: {
      emit: ['bootstrap.router', 'calendar.*', 'todos.*', '*', 'route.**'],
      on: ['bootstrap.router', 'calendar.*', 'todos.*', '*', 'route.**']
    }
  });

  return permissions;
});
