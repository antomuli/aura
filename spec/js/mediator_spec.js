define('spec/js/widgets/test_widget/main', function() {
  return function() {};
});

define('spec/js/widgets/test_emitqueue/main', function() {
  return function() {};
});


define('perms', ['aura_perms'], function(permissions) {
  'use strict';

  var SANDBOX_NAME = 'test_widget',
    TEST_EVENT = 'stub',
    TEST_CHANNEL = 'test_topic';


  var channelPerms = {};
  channelPerms[SANDBOX_NAME] = {};
  channelPerms[SANDBOX_NAME][TEST_CHANNEL] = true;

  permissions.extend(channelPerms);

  /* the above is equivalent to: 
  permissions.extend({
    test_widget: {
      'test_topic': true // this is a channel
    }
  });
  */

  return permissions;
});

define(['aura_core', 'aura_sandbox', 'perms', 'module'], function(mediator, sandbox, permissions, module) {
  var SANDBOX_NAME = 'test_widget',
    TEST_EVENT = 'stub',
    TEST_CHANNEL = 'test_topic';

  var prependChannel = function(channel, event) {
      event = mediator.normalizeEvent(event); // if needed, convert event to array format is using
      // . delimeters 'test.event' to ['test', 'event']
      event.unshift(channel);

      return event;
    };

  describe('PubSub', function() {
    //override method util as it uses jQuery proxy and doesn't
    //allow comparison of actual callback function object.
    mediator.util.method = function(fn, context) {
      return fn;
    };

    var sandboxes = {};

    sandboxes[SANDBOX_NAME] = {
      options: {
        element: '#todoapp'
      }
    };
    mediator.start(sandboxes);


    beforeEach(function() {
      // verify setup
      expect(mediator).toBeDefined();

    });

    describe('permissions', function() {
      it('should exist when extended with sandbox perms', function() {
        expect(permissions).toBeDefined();
      });

      describe('verification of parameters', function() {
        it('should throw an error if all the params are not specified', function() {
          expect(function() {
            permissions.validate();
          }).toThrow(new Error('Subscriber and channel must be defined'));
        });

        it("should throw an error if subscriber is NOT a string", function() {
          expect(function() {
            permissions.validate({}, TEST_CHANNEL);;
          }).toThrow(new Error('Subscriber must be a string'));
        });

        it("should throw an error if channel is NOT a string", function() {
          expect(function() {
            permissions.validate(SANDBOX_NAME, {});;
          }).toThrow(new Error('Channel must be a string'));
        });

      });

      describe('validate', function() {
        it('should have validation method', function() {
          expect(permissions.validate).toBeDefined();
        });
        it('should validate if channel is permitted on the sandbox', function() {
          expect(permissions.validate(TEST_CHANNEL, SANDBOX_NAME)).toBeTruthy();
        });
        it('should not validate if channel is permitted on the sandbox', function() {
          expect(permissions.validate(TEST_CHANNEL, 'notasandbox')).toBeFalsy();
          expect(permissions.validate('yo ha', SANDBOX_NAME)).toBeFalsy();
          expect(permissions.validate('yo ha', 'notasandbox')).toBeFalsy();
        });

        //it('should load permissions declaratively via obj literal of \'emit\' and \'on\'', function() {
      });
    });

    describe('listeners', function() {
      describe('verification of parameters', function() {
        it('should throw an error if all the params are not specified', function() {
          expect(function() {
            mediator.listeners();
          }).toThrow(new Error('Event must be defined'));
        });
        it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
          expect(function() {
            mediator.listeners({});
          }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
        });
      });
    });

    describe('on', function() {

      beforeEach(function() {
        mediator.removeAllListeners();
      });

      describe('verification of parameters', function() {
        it('should throw an error if all the params are not specified', function() {
          expect(function() {
            mediator.on();
          }).toThrow(new Error('Channel, event, subscriber, callback, and context must be defined'));
        });

        it("should throw an error if channel is not a string", function() {
          expect(function() {
            mediator.on({}, TEST_EVENT, SANDBOX_NAME, function() {}, {})
          }).toThrow(new Error('Channel must be a string'))
        });
        it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
          expect(function() {
            mediator.on(TEST_CHANNEL, {}, SANDBOX_NAME, function() {}, {});
          }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
        });

        it("should throw an error if typeof subscriber is NOT string. The subscriber should be the name of the sandbox widget", function() {
          expect(function() {
            mediator.on(TEST_CHANNEL, TEST_EVENT, {}, function() {}, {});
          }).toThrow(new Error('The widget sandbox name must be passed as string'));
        });

        it("should throw an error if typeof callback is NOT a function", function() {
          expect(function() {
            mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, {}, {});
          }).toThrow(new Error('Callback must be a function'));
        });
      });


      it('should allow an event to be subscribed', function() {
        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, function() {}, this);
        var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

        //expect(mediator.listeners(TEST_EVENT).length).toBe(1);
        expect(mediator.listeners(event).length).toBe(1);
      });

      it('should be able assign a specific callback for subscribed event', function() {
        var callback, callbackResult = 'callback';
        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, function() {}, this);

        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, function() {
          return callbackResult;
        }, this);

        var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

        callback = mediator.listeners(event)[1];
        expect(callback()).toBe(callbackResult);
      });

      it('should allow subscribing multiple callbacks for single event channel', function() {
        var callback1 = function() {};
        var callback2 = function() {};

        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, callback1, this);
        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, callback2, this);

        var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

        expect(mediator.listeners(event).length).toBe(2);
      });

      it('should allow subscribing for catchall \'*\' events', function() {
        var callback1 = function() {};

        var event = prependChannel(TEST_CHANNEL, '*');

        mediator.on(TEST_CHANNEL, '*', SANDBOX_NAME, callback1, this);
        expect(mediator.listeners(event).length).toBe(1);
        //expect(mediator.listenersAny().length).toBe(1);
      });

      it('should allow subscribing for catchall \'**\' events', function() {
        var callback1 = function() {};

        var event = prependChannel(TEST_CHANNEL, '**');

        mediator.on(TEST_CHANNEL, '**', SANDBOX_NAME, callback1, this);
        expect(mediator.listeners(event).length).toBe(1);
        //expect(mediator.listenersAny().length).toBe(1);
      });

      describe('should allow namespaces and wildcards', function() {

        it('should allow subscribing for namespaces, 2 level', function() {
          var callback1 = function() {};

          mediator.on(TEST_CHANNEL, 'test.dat', SANDBOX_NAME, callback1, this);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.dat')).length).toBe(1);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.*')).length).toBe(1);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.**')).length).toBe(1);
        });

        it('should allow subscribing for namespaces, 3 level, wildcard', function() {
          var callback1 = function() {};

          mediator.on(TEST_CHANNEL, 'test.dis.ptrn', SANDBOX_NAME, callback1, this);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.dis.ptrn')).length).toBe(1);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.*.ptrn')).length).toBe(1);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test.**.ptrn')).length).toBe(1);
        });

        it('should allow subscribing for namespaces, 4 level, wildcard + **', function() {
          var callback1 = function() {};

          mediator.on(TEST_CHANNEL, 'test2ns.khal.drogo.no', SANDBOX_NAME, callback1, this);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test2ns.khal.drogo.no')).length).toBe(1);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test2ns.*.no')).length).toBe(0);
          expect(mediator.listeners(prependChannel(TEST_CHANNEL, 'test2ns.**.no')).length).toBe(1);
        });

      });


    });

    describe('emit', function() {

      beforeEach(function() {
        mediator.removeAllListeners();
      });

      describe('verification of parameters', function() {
        it('should throw an error if all the params are not specified', function() {
          expect(function() {
            mediator.emit();
          }).toThrow(new Error('Channel must be defined'));

          expect(function() {
            mediator.emit(TEST_CHANNEL);
          }).toThrow(new Error('Event must be defined'));
        });

        it('should throw an error if typeof channel param is not string', function() {
          expect(function() {
            mediator.emit([]);
          }).toThrow(new Error('Channel must be a string'));
          expect(function() {
            mediator.emit(4);
          }).toThrow(new Error('Channel must be a string'));
        });

        it("should throw an error if typeof event is NOT a string or array in EventEmitter format", function() {
          expect(function() {
            mediator.emit(TEST_CHANNEL, {});
          }).toThrow(new Error('Event must be an EventEmitter compatible argument (string or array)'));
        });

      });

      it('should call every callback for a channel, within the correct context', function() {
        var callback = sinon.spy();

        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, callback, this);

        mediator.emit(TEST_CHANNEL, TEST_EVENT);

        expect(callback).toHaveBeenCalled();
      });

      it('should pass additional arguments to every call callback for a channel', function() {
        var callback = sinon.spy();
        var argument = {};

        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, callback, this);

        mediator.emit(TEST_CHANNEL, TEST_EVENT, argument);

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

        mediator.start({
          test_emitqueue: {
            options: {
              element: '#test_emitqueue'
            }
          }
        });
        mediator.on(TEST_CHANNEL, TEST_EVENT, 'test_emitqueue', function() {}, this);

        mediator.emit(TEST_CHANNEL, TEST_EVENT);

        expect(mediator.getEmitQueueLength()).toBe(1);
      });
    });

    describe('sandbox cleanup', function() {
      it('stopping a widget removes all listeners', function() {
        var callback = function() {};

        mediator.on(TEST_CHANNEL, TEST_EVENT, SANDBOX_NAME, callback, this);

        var event = prependChannel(TEST_CHANNEL, TEST_EVENT);

        expect(mediator.listeners(event).length).toBe(1);

        mediator.stop(SANDBOX_NAME);

        expect(mediator.listeners(event).length).toBe(0);

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
