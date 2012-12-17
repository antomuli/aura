// ## Sandbox
// Implements the sandbox pattern and set up an standard interface for modules.
// This is a subset of the mediator functionality.
define(function() {
  'use strict';

  return {
    create: function(mediator, module, permissions) {
      var sandbox = {};

      sandbox.log = function() {
        var args = Array.prototype.concat.apply([module], arguments);

        mediator.log.apply(mediator, args);
      };

      sandbox.log.event = function() {
        sandbox.log('[event2log] Event from: ' + module);
        if (arguments.length) {
          sandbox.log('Additional data:', arguments);
        }
      };

      // * **param:** {string} event
      // * **param:** {object} callback Module
      // * **param:** {object} context Callback context
      sandbox.on = function(channel, event, callback, context) {

        if (channel === undefined || event === undefined || callback === undefined || context === undefined) {
          throw new Error('Channel, event, callback and context must be defined');
        }

        if (typeof channel === 'undefined') {
          throw new Error('Channel must be defined');
        }

        if (typeof channel !== 'string') {
          throw new Error('Channel must be a string');
        }

        if (typeof event === 'undefined') {
          throw new Error('Event must be defined');
        }

        if ((typeof event !== 'string') && (!Array.isArray(event))) {
          throw new Error('Event must be an EventEmitter compatible argument (string or array)');
        }

        if (typeof event === 'function') {
          throw new Error('Callback must be defined');
        }

        // Prevent subscription if no permission
        if (!permissions.validate(channel, module)) {
          return;
        }

        event = mediator.normalizeEvent(event);
        event.unshift(channel); // for channel/topic
        event.unshift(module); // the subscribing module/sandbox

        mediator.on(event, callback, context || this);
        //core.on = function(event, subscriber, callback, context) {

      };

      // sandbox.logEvent can subscribe to events and print them
      //
      // * **param:** {string} event
      // * **param:** {object} context Callback context
      sandbox.on.log = function(channel, event, context) {
        mediator.on(channel, event, module, sandbox.log.event, context || this);
        //core.on = function(event, subscriber, callback, context) {

      };

      sandbox.listeners = function() {
        var event;
        if (arguments.length == 2) {
          var channel = arguments[0];
          event = mediator.normalizeEvent(arguments[1]);

          event.unshift(channel);

          return mediator.listeners(event);
        } else {
          event = mediator.normalizeEvent(arguments[0]);

          return mediator.listeners(event);
        }
      };


      // * **param:** {string} channel Event name
      sandbox.emit = function(channel, event) {

        var args = [].slice.call(arguments, 2);
        mediator.emit.apply(mediator, [channel, event, module].concat(args));
        //core.emit = function(event) {
      };

      // * **param:** {Object/Array} an array with objects or single object containing channel and element
      sandbox.start = function(list) {
        mediator.start.apply(mediator, arguments);
      };

      // * **param:** {string} channel Event name
      // * **param:** {string} el Element name
      sandbox.stop = function(module, el) {
        mediator.stop.apply(mediator, arguments);
      };

      sandbox.dom = {
        // * **param:** {string} selector CSS selector for the element
        // * **param:** {string} context CSS selector for the context in which
        // to search for selector
        // * **returns:** {object} Found elements or empty array
        find: function(selector, context) {
          return mediator.dom.find(selector, context);
        }
      };

      sandbox.events = {
        // * **param:** {object} context Element to listen on
        // * **param:** {string} events Events to trigger, e.g. click, focus, etc.
        // * **param:** {string} selector Items to listen for
        // * **param:** {object} data
        // * **param:** {object} callback
        listen: function(context, events, selector, callback) {
          mediator.events.listen(context, events, selector, callback);
        },
        bindAll: mediator.events.bindAll
      };

      sandbox.util = {
        each: mediator.util.each,
        extend: mediator.util.extend
      };

      sandbox.data = mediator.data;

      sandbox.template = mediator.template;

      return sandbox;

    }
  };
});
