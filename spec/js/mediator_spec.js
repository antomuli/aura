define(['aura_core', 'aura_sandbox', 'aura_perms', 'module'], function(mediator, sandbox, permissions, module) {
  describe('PubSub', function() {
    var pubsub, SANDBOX_NAME = 'test_widget',
      TEST_EVENT = 'stub';

    mediator.getSandbox = function(sandbox) {
      return sandbox;
    };

    //override method util as it uses jQuery proxy and doesn't
    //allow comparison of actual callback function object.
    mediator.util.method = function(fn, context) {
      return fn;
    };

    mediator.hasPermissions = function() {
      return true;
    };

    // Define stub widget main (to prevent RequireJS load errors)
    define('spec/js/widgets/test_widget/main', function() {
      return function() {};
    });

    beforeEach(function() {
      // verify setup
      expect(mediator).toBeDefined();
      expect(mediator['pubsubs']).toBeDefined();
      expect(mediator.pubsubs).toBeDefined();

      var pubsub = mediator.pubsubs[SANDBOX_NAME];
      pubsub.removeAllListeners();

    });

    describe('sandbox', function() {
      describe('creation of sandbox', function() {
        mediator.start([{
          channel: SANDBOX_NAME,
          options: {
            element: '#todoapp'
          }
        }]);

        it('should created a pubsub of the sandbox', function() {
          expect(mediator.pubsubs[SANDBOX_NAME]).toBeDefined();
        });
        //expect(mediator['pubsubs']).toBeDefined();
        //expect(mediator.pubsubs).toBeDefined();
        //expect(mediator.pubsubs[TEST_EVENT]).toBeDefined();
      });

    });

    describe('on', function() {

      describe('verification of parameters', function() {
        it('should throw an error if all the params are not specified', function() {
          expect(function() {
            mediator.on();
          }).toThrow(new Error('Event, subscriber, callback, and context must be defined'));
        });

        it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
          expect(function() {
            mediator.on({}, 'subscriber', function() {}, {});
          }).toThrow(new Error('Event must be a string or array'));
        });

        it("should throw an error if typeof subscriber is NOT string. The subscriber should be the name of the sandbox widget", function() {
          expect(function() {
            mediator.on('event', {}, function() {}, {});
          }).toThrow(new Error('The widget sandbox name must be passed as string'));
        });

        it("should throw an error if typeof callback is NOT a function", function() {
          expect(function() {
            mediator.on('channel', 'subscriber', 'callback', {});
          }).toThrow(new Error('Callback must be a function'));
        });
      });

      it('should allow an event to be subscribed', function() {
        var pubsub = mediator.pubsubs[SANDBOX_NAME];
        pubsub.on(TEST_EVENT, function() {}, this);
        expect(pubsub.listeners(TEST_EVENT).length).toBe(1);
      });

      it('should be able assign a specific callback for subscribed event', function() {
        var callback, callbackResult = 'callback';
        var pubsub = mediator.pubsubs[SANDBOX_NAME];
        pubsub.on(TEST_EVENT, function() {}, this);

        pubsub.on(TEST_EVENT, function() {
          return callbackResult;
        }, this);

        callback = pubsub.listeners(TEST_EVENT)[1];
        expect(callback()).toBe(callbackResult);
      });

      it('should allow subscribing multiple callbacks for single event channel', function() {
        var callback1 = function() {};
        var callback2 = function() {};
        var pubsub = mediator.pubsubs[SANDBOX_NAME];

        pubsub.on(TEST_EVENT, callback1, this);
        pubsub.on(TEST_EVENT, callback2, this);

        //expect(channels[TEST_EVENT]).toContain(callback1, callback2);
        expect(pubsub.listeners(TEST_EVENT).length).toBe(2);
      });
    });

    describe('emit', function() {

      describe('verification of parameters', function() {
        it('should throw an error if all the params are not specified', function() {
          expect(function() {
            mediator.emit();
          }).toThrow(new Error('Event must be defined'));
        });

        it('should throw an error if typeof channel param is not string', function() {
          expect(function() {
            mediator.emit({});
          }).toThrow(new Error('Event must be a string or an array'));
        });
      });

      it('should call every callback for a channel, within the correct context', function() {
        var callback = sinon.spy();

        var pubsub = mediator.pubsubs[SANDBOX_NAME];
        pubsub.on(TEST_EVENT, callback);

        mediator.emit(TEST_EVENT);

        expect(callback).toHaveBeenCalled();
      });

      it('should pass additional arguments to every call callback for a channel', function() {
        var callback = sinon.spy();
        var argument = {};

        var pubsub = mediator.pubsubs[SANDBOX_NAME];
        pubsub.on(TEST_EVENT, callback);

        mediator.emit(TEST_EVENT, argument);

        expect(callback).toHaveBeenCalledWith(argument);
      });

      /* 
       * this could only be implemented at sandbox level pubsub. mediator.emit
       * is global and broadcasts to all pubsubs
       *
      it('should return false if channel has not been defined', function() {
        var called = mediator.emit(TEST_EVENT);

        expect(called).toBe(false);
      });
       */

      it('should add to emit queue if widget is loading', function() {
        var pubsub = mediator.pubsubs[SANDBOX_NAME];
        pubsub.on(TEST_EVENT, function() {});

        mediator.start({
          channel: SANDBOX_NAME,
          options: {
            element: '#nothing'
          }
        });

        mediator.emit(TEST_EVENT);

        expect(mediator.getEmitQueueLength()).toBe(1);
      });
    });

    xdescribe('start', function() {
      it('should throw an error if all the params are not specified', function() {});
      it('should throw an error if all the params are not the correct type', function() {});
      it('should load (require) a widget that corresponds with a channel', function() {});
      it('should call every callback for the channel, within the correct context', function() {});
      it('should trigger a requirejs error if the widget does not exist', function() {});
    });

    xdescribe('stop', function() {
      it('should throw an error if all the params are not specified', function() {});
      it('should throw an error if all the params are not the correct type', function() {});
      it('should call unload with the correct widget to unload from the app', function() {});
      it('should empty the contents of a specific widget\'s container div', function() {});
    });

    // This one will need to be researched a little more to determine exactly what require does
    xdescribe('unload', function() {
      it('should throw an error if all the params are not specified', function() {});
      it('should throw an error if all the params are not the correct type', function() {});
      it('should unload a module and all modules under its widget path', function() {});
    });
  });
});
