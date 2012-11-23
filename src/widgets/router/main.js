/*globals Backbone*/
define(['sandbox', 'underscore'], function(sandbox, _) {
  "use strict";

  return function(element) {
    var Router = sandbox.mvc.Router({
      initialize: function() {
        Backbone.history.start();

        sandbox.emit('bootstrap', 'router', 'Initialized Router');
      },
      routes: {
        '*router': 'router'
      },

      router: function(args) {
        var slice = Array.prototype.slice;
        var event, route;
        args = args.split('/');
        event = slice.call(args,0);
        route = event.join('.');

        sandbox.emit('route', route, args);
      }

    });

    var router = new Router();

    sandbox.on.log('bootstrap', 'router');
    sandbox.on.log('route', '*');
  };

});
