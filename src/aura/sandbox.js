// ## Sandbox
// Implements the sandbox pattern and set up an standard interface for modules.
// This is a subset of the mediator functionality.
define(function() {
  'use strict';

  return {
    create: function(mediator, channel) {
      var sandbox = {};

      sandbox.log = function() {
        var args = Array.prototype.concat.apply([channel], arguments);

        mediator.log.apply(mediator, args);
      };

      sandbox.log.event = function() {
        sandbox.log('[event2log] Event from: ' + channel);
        if (arguments.length) {
          sandbox.log('Additional data:', arguments);
        }
      };

      // * **param:** {string} event
      // * **param:** {object} callback Module
      // * **param:** {object} context Callback context
      sandbox.on = function(event, callback, context) {
        mediator.on(event, channel, callback, context || this);
        //core.on = function(event, subscriber, callback, context) {

      };

      // sandbox.logEvent can subscribe to events and print them
      //
      // * **param:** {string} event
      // * **param:** {object} context Callback context
      sandbox.on.log = function(event, context) {
        mediator.on(event, channel, sandbox.log.event, context || this);
        //core.on = function(event, subscriber, callback, context) {

      };


      // * **param:** {string} channel Event name
      sandbox.emit = function() {
        mediator.emit.apply(mediator, arguments);
        //core.emit = function(event) {
      };

      // * **param:** {Object/Array} an array with objects or single object containing channel and element
      sandbox.start = function(list) {
        mediator.start.apply(mediator, arguments);
      };

      // * **param:** {string} channel Event name
      // * **param:** {string} el Element name
      sandbox.stop = function(channel, el) {
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
